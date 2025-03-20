import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";

import { useTracking } from "@renderer/analytics";
import { gamesQueryOptions } from "@renderer/apis/gamesQueryOptions";
import ImageProgress from "@renderer/components/ImageProgress";
import { Popover, PopoverContent, PopoverTrigger } from "@renderer/components/ui/popover";
import useGetLocalGameIds from "@renderer/hooks/useGetLocalGameIds";
import { useTranslation } from "@renderer/i18n/useTranslation";
import {
  useDownloadProgressProvider,
  useDownloadQueueProvider,
} from "@renderer/providers/DownloadProvider";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";
import { isDownloadContainingErrors, isInstallSuccess } from "@renderer/utils/download";

import type { GameClientId, ListPageGameInfo } from "@src/types/game";
import type { DownloadInitInfo, DownloadProgressInfo } from "@src/types/system";

import { ActiveItemWrapper } from "../sidebar/ActiveItemWrapper";
import { HoverSidebarItemWrapper } from "../sidebar/HoverSidebarItemWrapper";
import DownloadSubscriber from "./DownloadSubscriber";
import DownloadTracker from "./DownloadTracker";
import { ListItem } from "./ListItem";

const useActiveGameItem = (): ((gameId: GameClientId) => boolean) => {
  const params = useParams({ strict: false });
  const isActiveGame = (gameId: GameClientId): boolean => params.gameClientId === gameId;
  return isActiveGame;
};
const emptyGames: ListPageGameInfo[] = [];
export const GameDownloadTrackerList = (): JSX.Element => {
  const { downloadsList } = useDownloadQueueProvider();
  const { language } = useLanguageProvider();
  const { launcherUser, guestId } = useSessionProvider();
  const { data } = useQuery(gamesQueryOptions({ language, guestId, userId: launcherUser?.userId }));
  const games = data?.items || emptyGames;

  const { data: localGameIds } = useGetLocalGameIds();
  const [localGames, setLocalGames] = useState<ListPageGameInfo[]>([]);
  const { track } = useTracking();
  useEffect(() => {
    games &&
      localGameIds &&
      setLocalGames(
        games.filter(
          (game) =>
            localGameIds.includes(game.id) &&
            !downloadsList.some((download) => download.gameClientId === game.id),
        ),
      );
  }, [games, downloadsList, localGameIds]);
  const isActiveGame = useActiveGameItem();
  return (
    <div className="flex flex-col gap-2">
      {downloadsList.map((downloadInitInfo) => (
        <GameDownloadTrackerItem
          key={downloadInitInfo.gameClientId}
          downloadInitInfo={downloadInitInfo}
        />
      ))}
      {localGames.map((game) => (
        <Link
          key={game.id}
          to="/games/$gameClientId"
          replace={true}
          params={{
            gameClientId: game.id,
          }}
          onClick={() => {
            track({
              name: "view_game_detail",
              payload: {
                gameId: game.id,
              },
            });
          }}
        >
          <ActiveItemWrapper isActive={isActiveGame(game.id)}>
            <HoverSidebarItemWrapper content={game.title}>
              <ImageProgress
                className="rounded-lg"
                progress={100}
                imageUrl={game.icon.url}
                height={48}
                width={48}
                padding={6}
              />
            </HoverSidebarItemWrapper>
          </ActiveItemWrapper>
        </Link>
      ))}

      {downloadsList.map((downloadInitInfo) => (
        <DownloadTracker
          key={downloadInitInfo.gameClientId}
          clientId={downloadInitInfo.gameClientId}
          internalVersions={downloadInitInfo.gameUpdateInfo.resources.map(
            ({ internalVersion }) => internalVersion,
          )}
        />
      ))}
    </div>
  );
};

type GameDownloadTrackerItemsProps = {
  downloadInitInfo: DownloadInitInfo;
};

const GameDownloadTrackerItem = ({
  downloadInitInfo,
}: GameDownloadTrackerItemsProps): JSX.Element => {
  const [isOpen, _setIsOpen] = useState(false);
  const { track } = useTracking();

  const { t } = useTranslation();

  const setIsOpen = useCallback((open: boolean) => {
    _setIsOpen(open);
  }, []);

  const onInstallComplete = useCallback(
    ({ initInfo: { remoteGameInfo } }: DownloadProgressInfo) => {
      window.api.sendNotification({
        title: t("notification.download.success.title"),
        body: t("notification.download.success.description", { title: remoteGameInfo.title }),
      });

      setIsOpen(true);
    },
    [setIsOpen, t],
  );

  const onInterrupted = useCallback(
    ({
      initInfo: { gameClientId, downloadInitTime },
      progress,
      currentDownloadIndex,
    }: DownloadProgressInfo) => {
      const currentDownloadItem = progress[currentDownloadIndex];
      const interruptReason = currentDownloadItem.download.interruptReason;
      setIsOpen(true);
      track({
        name: "download_progress_interrupted",
        payload: {
          gameId: gameClientId,
          reason: interruptReason,
          download_init_time: downloadInitTime,
          internal_version: currentDownloadItem.internalVersion,
        },
      });
    },
    [setIsOpen, track],
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger>
        <GameDownloadTrackerLabel
          downloadInitInfo={downloadInitInfo}
          onInstallComplete={onInstallComplete}
          onInterrupted={onInterrupted}
          triggerDialog={(open) => setIsOpen(open)}
        />
      </PopoverTrigger>
      <PopoverContent
        className={`relative mt-2 w-[400px] rounded-xl pr-4`}
        side="right"
        align="end"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <ListItem key={downloadInitInfo.gameClientId} title={downloadInitInfo.remoteGameInfo.title}>
          <DownloadSubscriber
            clientId={downloadInitInfo.gameClientId}
            authType={downloadInitInfo.remoteGameInfo.authType}
            metadata={downloadInitInfo.remoteGameInfo.metadata}
            downloadInitTime={downloadInitInfo.downloadInitTime}
            makeSureTheMenuIsClosed={() => {
              setIsOpen(false);
            }}
            allowedActions={false}
            gameUpdateInfo={downloadInitInfo.gameUpdateInfo}
          />
        </ListItem>
      </PopoverContent>
    </Popover>
  );
};

type GameDownloadTrackerLabelProps = {
  downloadInitInfo: DownloadInitInfo;
  onInstallComplete: (info: DownloadProgressInfo) => void;
  onInterrupted: (info: DownloadProgressInfo) => void;
  triggerDialog: (open: boolean) => void;
};
const GameDownloadTrackerLabel = ({
  downloadInitInfo,
  onInstallComplete,
  onInterrupted,
  triggerDialog,
}: GameDownloadTrackerLabelProps): JSX.Element => {
  const { addSubscriber } = useDownloadProgressProvider();
  const [currentInfo, setCurrentInfo] = useState<DownloadProgressInfo>();
  const { track } = useTracking();
  const isActiveGame = useActiveGameItem();
  useLayoutEffect(() => {
    const unsubscriber = addSubscriber(
      downloadInitInfo.gameClientId,
      (info: DownloadProgressInfo) => {
        setCurrentInfo(info);
        if (isInstallSuccess(info)) {
          onInstallComplete(info);
        }
      },
    );
    return (): void => {
      unsubscriber();
    };
  }, [addSubscriber, onInterrupted, onInstallComplete, downloadInitInfo.gameClientId, track]);
  if (!currentInfo) return <></>;

  return (
    <div onMouseOver={() => triggerDialog(true)} onMouseOut={() => triggerDialog(false)}>
      <Link
        key={downloadInitInfo.gameClientId}
        replace={true}
        to="/games/$gameClientId"
        params={{
          gameClientId: downloadInitInfo.gameClientId,
        }}
        onClick={() => {
          track({
            name: "view_game_detail",
            payload: {
              gameId: downloadInitInfo.gameClientId,
            },
          });
        }}
      >
        <ActiveItemWrapper isActive={isActiveGame(downloadInitInfo.gameClientId)}>
          <ImageProgress
            className="rounded-lg"
            progress={
              currentInfo.progress.find(({ download }) => download.status === "progressing")
                ?.download.percent || 100
            }
            imageUrl={currentInfo.initInfo.remoteGameInfo.icon.url}
            height={48}
            width={48}
            padding={6}
            showSuccess={isInstallSuccess(currentInfo)}
            showFail={isDownloadContainingErrors(currentInfo)}
          />
        </ActiveItemWrapper>
      </Link>
    </div>
  );
};
