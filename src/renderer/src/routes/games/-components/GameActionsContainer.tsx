import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, type ReactNode } from "react";

import { gameUpdateQueryOptions } from "@renderer/apis/gameUpdateQueryOptions";
import { ActionButtonSkeleton } from "@renderer/components/skeleton/GameDetailSkeleton";
import { Button } from "@renderer/components/ui/button";
import useGameActions from "@renderer/hooks/useGameActions";
import useGetLocalGameInfo from "@renderer/hooks/useGetLocalGameInfo";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";
import {
  GameActionNative,
  GameActionWeb,
} from "@renderer/routes/-components-game-actions/GameActions";
import { GameActionContainer } from "@renderer/routes/-components-game-actions/GameCardAction";

import { type DetailsPageGameInfo } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

type DownloadActionDetailProps = {
  remoteGameInfo: DetailsPageGameInfo;
};

function GameAutoPlay({
  remoteGameInfo,
  gameUpdateInfo,
}: {
  remoteGameInfo: DetailsPageGameInfo;
  gameUpdateInfo: GameUpdateInfo;
}): JSX.Element {
  const { triggerState } = useSearch({ from: "/games/$gameClientId" });
  const { isValidatingUserSession } = useSessionProvider();
  const navigate = useNavigate();
  const clearTriggerState = useCallback(() => {
    void navigate({
      from: "/games/$gameClientId",
      search: () => ({ triggerState: "" }),
      replace: true,
    });
  }, [navigate]);
  const { play } = useGameActions(
    remoteGameInfo.id,
    remoteGameInfo.authType,
    remoteGameInfo.metadata,
    gameUpdateInfo,
  );

  useEffect(() => {
    if (isValidatingUserSession) return;

    if (triggerState === "AutoStartNativeGameAfterLogin") {
      clearTriggerState?.();
      void play("redirect_after_login");
    }
    if (triggerState === "AutoStartNativeGameOnOpenShortcut") {
      clearTriggerState?.();
      void play("desktop_shortcut");
    }
  }, [triggerState, clearTriggerState, isValidatingUserSession, play]);
  return <> </>;
}
const Wrapper = ({ children }: { children: ReactNode }): ReactNode => {
  return children;
};
export const GameActionsContainer = ({
  remoteGameInfo,
}: DownloadActionDetailProps): JSX.Element => {
  const { t } = useTranslation();
  const { data: localGameInfo, isLoading, refetch } = useGetLocalGameInfo(remoteGameInfo.id);
  const { guestId, launcherUser, userSession } = useSessionProvider();
  const { language } = useLanguageProvider();
  const { isFetching: isCheckingForUpdate, data: gameUpdateInfo } = useQuery(
    gameUpdateQueryOptions(
      {
        internalVersion: localGameInfo
          ? localGameInfo.internalVersion
          : remoteGameInfo.internalVersion,
        gameClientId: remoteGameInfo.id,
        guestId,
        userId: launcherUser?.userId,
        language,
        session: userSession,
      },
      {
        enabled: !isLoading,
      },
      {
        remoteGameInfo: localGameInfo ? null : remoteGameInfo,
      },
    ),
  );

  if (isLoading) {
    return (
      <GameActionContainer
        gameId={remoteGameInfo.id}
        playButton={
          <Wrapper>
            <Button disabled variant="white" size="downloadCTA" className="w-full">
              {t("actions.isLoadingData")}
            </Button>
          </Wrapper>
        }
      />
    );
  }
  if (isCheckingForUpdate) {
    return <ActionButtonSkeleton />;
  }

  return (
    <div
      className="white-shadow-drop hover:white-shadow-hover-drop w-[355px] rounded-lg"
      data-testid="game-action"
    >
      {remoteGameInfo && (
        <GameAutoPlay remoteGameInfo={remoteGameInfo} gameUpdateInfo={gameUpdateInfo} />
      )}
      {remoteGameInfo.status === "available" ? (
        remoteGameInfo.productType === "web-based" ? (
          <GameActionWeb remoteGameInfo={remoteGameInfo} />
        ) : (
          <GameActionNative
            remoteGameInfo={remoteGameInfo}
            key={remoteGameInfo.id}
            triggerRefetchLocalGameInfo={refetch}
            localGameInfo={localGameInfo}
            gameUpdateInfo={gameUpdateInfo}
          />
        )
      ) : (
        <Button size="xl" variant="white" disabled className="w-full">
          <Lock className="mr-2" /> {t("game.comingSoon")}
        </Button>
      )}
    </div>
  );
};
