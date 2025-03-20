import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { useTracking } from "@renderer/analytics";
import type { ButtonGroupChildrenExtraProps } from "@renderer/components/ButtonGroup";
import { UninstallSkeleton } from "@renderer/components/skeleton/GameDetailSkeleton";
import { Button } from "@renderer/components/ui/button";
import useLocateGame from "@renderer/hooks/useLocateGame";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { cn } from "@renderer/lib/utils";
import { useForceLoginProvider } from "@renderer/providers/ForceLoginProvider";

import type { DetailsPageGameInfo, LocalGameInfoV3 } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";
import { shouldUpdateGame } from "@src/utils/utils";

import { DownloadOrUpdateDialog } from "./DownloadDialog";
import { GameActionMenu } from "./GameActionMenu";
import { GameActionContainer } from "./GameCardAction";
import { PiiDeclareDialog } from "./PiiDeclareProvider";
import PlayButton from "./PlayButton";

export const GameActionWeb = ({
  remoteGameInfo,
}: {
  remoteGameInfo: DetailsPageGameInfo;
}): JSX.Element => {
  const { id: clientId } = remoteGameInfo;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { track } = useTracking();
  const { triggerForceLoginPlayGame } = useForceLoginProvider();

  return (
    <Button
      variant="white"
      size="downloadCTA"
      className="w-full uppercase"
      onClick={async () => {
        const result = await triggerForceLoginPlayGame(
          {
            name: "PLAY_WEB_GAME",
            payload: {
              gameClientId: clientId,
            },
          },
          remoteGameInfo.authType,
        );
        if (result === "can-not-continue") return;

        void navigate({
          to: "/webgame/$gameClientId",
          params: {
            gameClientId: clientId,
          },
        });
        track({
          name: "init_start_play_game",
          payload: {
            gameId: remoteGameInfo.id,
            source: "play_button",
          },
        });
      }}
    >
      {t("actions.playNow")}
    </Button>
  );
};

const LookingForGameButton = ({ className, size }: ButtonGroupChildrenExtraProps): JSX.Element => {
  return (
    <Button
      variant="white"
      size={size ? size : "lg"}
      className={cn("grow !font-bold", className)}
      disabled={true}
    >
      Looking for game...
    </Button>
  );
};

const LocateGameBeforeShowDownload = ({
  remoteGameInfo,
  children,
  onLocateGameSuccess,
}: {
  remoteGameInfo: DetailsPageGameInfo;
  children: ReactNode;
  onLocateGameSuccess: () => void;
}): ReactNode => {
  const { isFetching: isLocatingGame, data: result } = useLocateGame(remoteGameInfo);

  useEffect(() => {
    if (result) {
      onLocateGameSuccess();
    }
  }, [result, onLocateGameSuccess]);

  if (isLocatingGame)
    return <GameActionContainer gameId={remoteGameInfo.id} playButton={<LookingForGameButton />} />;

  return children;
};

export const GameActionNative = ({
  remoteGameInfo,
  localGameInfo,
  gameUpdateInfo,
  triggerRefetchLocalGameInfo,
}: {
  remoteGameInfo: DetailsPageGameInfo;
  localGameInfo: LocalGameInfoV3 | null;
  gameUpdateInfo: GameUpdateInfo;
  triggerRefetchLocalGameInfo: () => void;
}): JSX.Element => {
  const [isUninstalling, setIsUninstalling] = useState(false);
  if (isUninstalling) {
    return <UninstallSkeleton gameId={remoteGameInfo.id} />;
  }
  if (localGameInfo) {
    if (!shouldUpdateGame(localGameInfo.internalVersion, gameUpdateInfo))
      return (
        <>
          <PiiDeclareDialog />
          <GameActionContainer
            gameId={remoteGameInfo.id}
            playButton={
              <PlayButton remoteGameInfo={remoteGameInfo} gameUpdateInfo={gameUpdateInfo} />
            }
            gameMenuButton={
              <GameActionMenu
                remoteGameInfo={remoteGameInfo}
                gameUpdateInfo={gameUpdateInfo}
                isUninstalling={isUninstalling}
                setIsUninstalling={setIsUninstalling}
              />
            }
          />
        </>
      );
  }

  return (
    <LocateGameBeforeShowDownload
      remoteGameInfo={remoteGameInfo}
      onLocateGameSuccess={triggerRefetchLocalGameInfo}
    >
      <DownloadOrUpdateDialog
        localGameInfo={localGameInfo}
        remoteGameInfo={remoteGameInfo}
        gameUpdateInfo={gameUpdateInfo}
        onSuccess={triggerRefetchLocalGameInfo}
      />
    </LocateGameBeforeShowDownload>
  );
};
