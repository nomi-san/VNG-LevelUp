import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CircleCheckBig, CircleX } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useTracking } from "@renderer/analytics";
import downloadIcon from "@renderer/assets/download/download.svg";
import type { ButtonGroupChildrenExtraProps } from "@renderer/components/ButtonGroup";
import { UninstallSkeleton } from "@renderer/components/skeleton/GameDetailSkeleton";
import ImgWithSkeleton from "@renderer/components/skeleton/ImageWithSkeleton";
import { Button } from "@renderer/components/ui/button";
import { Checkbox } from "@renderer/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@renderer/components/ui/dialog";
import { Input } from "@renderer/components/ui/input";
import { Label } from "@renderer/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import useDownloadSubscriber from "@renderer/hooks/useDownloadSubscriber";
import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { cn } from "@renderer/lib/utils";
import { useDownloadQueueProvider } from "@renderer/providers/DownloadProvider";
import { DownloadStatus } from "@renderer/routes/-components-game-actions/DownloadStatus";
import { GameActionMenu } from "@renderer/routes/-components-game-actions/GameActionMenu";
import {
  calculateTotalDownloadSize,
  convertBytesToMB,
  isDownloadCancelled,
  isInstallSuccess,
} from "@renderer/utils/download";

import type { DetailsPageGameInfo, LocalGameInfoV3 } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";
import type { DirectoryInfo, SelectDirectoryAndAppendFolder } from "@src/types/system";
import { gameIsInstalled, shouldUpdateGame } from "@src/utils/utils";

import { GameActionContainer } from "./GameCardAction";

const SpaceAndTime = ({
  availableSpace,
  gameUpdateInfo,
}: {
  availableSpace: number;
  gameUpdateInfo: GameUpdateInfo;
}): JSX.Element => {
  const { t } = useTranslation();
  // Assume download rate: 5MBps
  const estimatedTimeToDownload = calculateTotalDownloadSize(gameUpdateInfo).sizeInMB / 5;
  const estimatedTimeMinute = Math.floor(estimatedTimeToDownload / 60);
  const estimatedTimeSecond = Math.floor(estimatedTimeToDownload - estimatedTimeMinute * 60);
  return (
    <>
      <div className="flex items-center justify-between">
        <Label className="body-14-regular">{t("download.spaceRequired")}</Label>
        <div className="flex items-center gap-2">
          <Label className="body-14-regular text-neutral-50">
            {calculateTotalDownloadSize(gameUpdateInfo).sizeInText}
          </Label>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger className="cursor-pointer" asChild>
                {convertBytesToMB(availableSpace) >
                calculateTotalDownloadSize(gameUpdateInfo).sizeInMB ? (
                  <CircleCheckBig className="h-5 w-5 text-green-500" />
                ) : (
                  <CircleX className="text-red-500" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {t("download.storageAvailable")}
                  {convertBytesToMB(availableSpace)} MB
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="flex justify-between">
        <Label className="body-14-regular">{t("download.estimatedTime")}</Label>
        <Label className="body-14-regular text-neutral-50">
          {t("game.estimatedDownloadTime", {
            minutes: estimatedTimeMinute,
            seconds: estimatedTimeSecond,
          })}
        </Label>
      </div>
    </>
  );
};

const DownloadDialogContent = ({
  localGameInfo,
  remoteGameInfo,
  gameUpdateInfo,
}: {
  localGameInfo: LocalGameInfoV3 | null;
  remoteGameInfo: DetailsPageGameInfo;
  gameUpdateInfo: GameUpdateInfo;
}): JSX.Element => {
  const { t } = useTranslation();
  const { appendDownload } = useDownloadQueueProvider();
  const [gameDirectory, setGameDirectory] = useState("");
  const [availableStorage, setAvailableStorage] = useState(0);
  const { track } = useTracking();
  const hasEnoughStorage =
    convertBytesToMB(availableStorage) > calculateTotalDownloadSize(gameUpdateInfo).sizeInMB;
  const [shouldCreateShortcut, setShouldCreateShortcut] = useState<boolean>(true);
  const [gameHasToBeUpdated, setGameHasToBeUpdated] = useState<boolean>(false);
  const onClickCheckGameDir = async (): Promise<void> => {
    const params: SelectDirectoryAndAppendFolder = {
      directory: remoteGameInfo.installPath,
    };
    const result = await window.api.selectFolder(params);
    if (!result) return;

    const {
      selectedDir,
      availableStorage: { diskSpaceAvailableForUser },
    } = result;

    track({
      name: "check_user_available_storage",
      payload: {
        gameId: remoteGameInfo.id,
        version: remoteGameInfo.internalVersion,
        hasEnoughStorage: hasEnoughStorage,
      },
    });

    setGameDirectory(selectedDir);
    setAvailableStorage(diskSpaceAvailableForUser);
  };

  const updateGameDir = useCallback(
    ({ selectedDir, availableStorage: { diskSpaceAvailableForUser } }: DirectoryInfo): void => {
      if (selectedDir) {
        const hasEnoughStorage =
          convertBytesToMB(diskSpaceAvailableForUser) >
          calculateTotalDownloadSize(gameUpdateInfo).sizeInMB;
        track({
          name: "check_user_available_storage",
          payload: {
            gameId: remoteGameInfo.id,
            version: remoteGameInfo.internalVersion,
            hasEnoughStorage: hasEnoughStorage,
          },
        });
      }
      setGameDirectory(selectedDir);
      setAvailableStorage(diskSpaceAvailableForUser);
    },
    [remoteGameInfo.id, gameUpdateInfo, remoteGameInfo.internalVersion, track],
  );
  const getGameDir = useCallback(async () => {
    const gameInfo = await window.api.store_getGameInfo(remoteGameInfo.id);
    if (gameInfo && shouldUpdateGame(gameInfo.internalVersion, gameUpdateInfo)) {
      setGameHasToBeUpdated(true);
      const result = await window.api.app_checkForAvailableStorage(gameInfo.rootFolderPath);
      updateGameDir(result);
      return;
    }
    if (gameDirectory) {
      const result = await window.api.app_checkForAvailableStorage(gameDirectory);
      updateGameDir(result);
      return;
    }
    const params: SelectDirectoryAndAppendFolder = {
      directory: remoteGameInfo.installPath,
    };
    const result = await window.api.store_getDefaultGameDir(params);
    if (!result) return;
    updateGameDir(result);
  }, [remoteGameInfo.id, remoteGameInfo.installPath, updateGameDir, gameUpdateInfo, gameDirectory]);

  const isUnmounted = useIsUnmountedRef();

  useEffect(() => {
    if (isUnmounted.current) return;

    void getGameDir();
  }, [getGameDir, isUnmounted]);

  return (
    <div className="flex justify-between overflow-hidden rounded-xl bg-neutral-900">
      <ImgWithSkeleton
        className="h-full w-[138px] min-w-[138px] bg-cover bg-center"
        src={remoteGameInfo.verticalThumbnail.url}
      />
      <div className="w-full p-4">
        <div className="mb-4 flex flex-col gap-5">
          <p className="heading-4 flex items-center">
            {t("download.dialogTitle", { title: remoteGameInfo.title })}
          </p>
          <div className="flex flex-col gap-1.5 pb-2">
            <p className="body-14-regular">{t("download.chooseDir")}</p>
            <div className="flex items-center justify-center gap-2">
              <Input
                disabled={true}
                placeholder="Choose a folder"
                id="path"
                customSize="medium"
                value={gameDirectory}
                onChange={() => {}}
              />
              <Button onClick={onClickCheckGameDir} variant="outline" disabled={gameHasToBeUpdated}>
                {t("download.changeDir")}
              </Button>
            </div>
            {!hasEnoughStorage && (
              <p className="caption-12-regular text-red-500">{t("validation.notEnoughStorage")}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <SpaceAndTime availableSpace={availableStorage} gameUpdateInfo={gameUpdateInfo} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="shortcut"
              checked={shouldCreateShortcut}
              onCheckedChange={(checked) => setShouldCreateShortcut(Boolean(checked))}
            />
            <label htmlFor="shortcut" className="body-14-regular">
              {t("actions.createShortcut")}
            </label>
          </div>
        </div>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button
              className="!font-bold uppercase"
              variant="white"
              size="lg"
              disabled={!gameDirectory || !remoteGameInfo || !hasEnoughStorage}
              data-testid={`download-start-button-${remoteGameInfo.id}`}
              onClick={() => {
                const downloadInitTime = Date.now();

                if (gameDirectory) {
                  if (
                    gameIsInstalled(localGameInfo) &&
                    shouldUpdateGame(localGameInfo.internalVersion, gameUpdateInfo)
                  ) {
                    track({
                      name: "click_update_start",
                      payload: {
                        gameId: remoteGameInfo.id,
                        current_internal_version: localGameInfo.internalVersion,
                        internal_versions: gameUpdateInfo.resources.map(
                          ({ internalVersion }) => internalVersion,
                        ),
                        update_init_time: downloadInitTime,
                      },
                    });
                  } else {
                    track({
                      name: "click_download_start",
                      payload: {
                        gameId: remoteGameInfo.id,
                        internal_versions: gameUpdateInfo.resources.map(
                          ({ internalVersion }) => internalVersion,
                        ),
                        download_init_time: downloadInitTime,
                      },
                    });
                  }

                  appendDownload({
                    properties: { directory: gameDirectory },
                    remoteGameInfo: remoteGameInfo,
                    gameClientId: remoteGameInfo.id,
                    shouldCreateShortcut,
                    downloadInitTime,
                    gameUpdateInfo,
                  });
                }
              }}
              type="submit"
            >
              {t("download.start")}
            </Button>
          </DialogTrigger>
        </DialogFooter>
      </div>
    </div>
  );
};

const DownloadButton = ({
  onClick,
  localGameInfo,
  className,
  size,
}: {
  onClick: () => void;
  localGameInfo: LocalGameInfoV3 | null;
} & ButtonGroupChildrenExtraProps): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Button
      variant="white"
      size={size ? size : "lg"}
      className={cn("grow !font-bold uppercase", className)}
      onClick={onClick}
    >
      <img src={downloadIcon} className="mr-2 min-h-6 min-w-6" />
      {gameIsInstalled(localGameInfo) ? t("download.update") : t("download.download")}
    </Button>
  );
};
const DownloadOrUpdateDialogButton = ({
  localGameInfo,
  remoteGameInfo,
  gameUpdateInfo,
}: {
  localGameInfo: LocalGameInfoV3 | null;
  remoteGameInfo: DetailsPageGameInfo;
  gameUpdateInfo: GameUpdateInfo;
}): JSX.Element => {
  const [isUninstalling, setIsUninstalling] = useState(false);
  const { track } = useTracking();

  const [openDialog, setOpenDialog] = useState(false);
  const toggleDownloadDialog = useCallback((): void => {
    setOpenDialog((curStatus) => {
      if (!curStatus)
        track({
          name: "click_download_init",
          payload: {
            gameId: remoteGameInfo.id,
          },
        });
      return !curStatus;
    });
  }, [remoteGameInfo.id, track]);

  const {
    location: { search },
  } = useRouterState();
  const navigate = useNavigate();
  const clearTriggerState = useCallback(() => {
    void navigate({
      search: () => ({ triggerState: "" }),
      replace: true,
    });
  }, [navigate]);
  useEffect(() => {
    if (search.triggerState === "AutoOpenDownloadDialog") {
      toggleDownloadDialog();
      clearTriggerState?.();
    }
  }, [clearTriggerState, toggleDownloadDialog, search.triggerState]);
  if (isUninstalling) {
    return <UninstallSkeleton gameId={remoteGameInfo.id} />;
  }
  return (
    <>
      <GameActionContainer
        gameId={remoteGameInfo.id}
        playButton={
          <DownloadButton
            localGameInfo={localGameInfo}
            onClick={() => {
              toggleDownloadDialog();
            }}
          />
        }
        gameMenuButton={
          gameIsInstalled(localGameInfo) &&
          shouldUpdateGame(localGameInfo.internalVersion, gameUpdateInfo) ? (
            <GameActionMenu
              remoteGameInfo={remoteGameInfo}
              gameUpdateInfo={gameUpdateInfo}
              isUninstalling={isUninstalling}
              setIsUninstalling={setIsUninstalling}
            />
          ) : null
        }
      />
      <Dialog open={openDialog} onOpenChange={toggleDownloadDialog}>
        <DialogContent className="max-w-[570px] gap-4 p-0">
          <VisuallyHidden>
            <DialogTitle></DialogTitle>
          </VisuallyHidden>
          <DownloadDialogContent
            localGameInfo={localGameInfo}
            remoteGameInfo={remoteGameInfo}
            gameUpdateInfo={gameUpdateInfo}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export const DownloadOrUpdateDialog = ({
  localGameInfo,
  remoteGameInfo,
  gameUpdateInfo,
  onSuccess,
}: {
  localGameInfo: LocalGameInfoV3 | null;
  remoteGameInfo: DetailsPageGameInfo;
  gameUpdateInfo: GameUpdateInfo;
  onSuccess: () => void;
}): JSX.Element => {
  const { id } = remoteGameInfo;

  const { isLoading, downloadProgressInfo } = useDownloadSubscriber(id, onSuccess);

  if (isLoading)
    return (
      <Button variant="white" size="downloadCTA" disabled className="w-full">
        Loading...
      </Button>
    );

  if (
    downloadProgressInfo === "NOT_FOUND" ||
    isDownloadCancelled(downloadProgressInfo) ||
    (isInstallSuccess(downloadProgressInfo) &&
      (!localGameInfo || shouldUpdateGame(localGameInfo.internalVersion, gameUpdateInfo)))
  ) {
    return (
      <DownloadOrUpdateDialogButton
        localGameInfo={localGameInfo}
        remoteGameInfo={remoteGameInfo}
        gameUpdateInfo={gameUpdateInfo}
      />
    );
  }

  return <DownloadStatus downloadProgressInfo={downloadProgressInfo} />;
};
