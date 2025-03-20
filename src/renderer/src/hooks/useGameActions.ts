import { useCallback, useLayoutEffect, useState } from "react";

import { useTracking } from "@renderer/analytics";
import type { InitStartPlayGame } from "@renderer/analytics/types";
import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useForceLoginProvider } from "@renderer/providers/ForceLoginProvider";

import type { DetailsPageGameInfo, GameClientId, ProductAuthType } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";
import type { PlayNativeGameParams } from "@src/types/native-game";
import { shouldUpdateGame } from "@src/utils/utils";

import {
  useSubscribeToGamePiiAwaiting,
  useSubscribeToGameStart,
  useSubscribeToGameTermination,
} from "./useGameStateSubscribers";

const useGameActions = (
  clientId: GameClientId,
  authType: ProductAuthType,
  metadata: DetailsPageGameInfo["metadata"],
  gameUpdateInfo: GameUpdateInfo,
): {
  shouldDisablePlay: boolean;
  textShouldDisablePlay: string;
  play: (source: InitStartPlayGame["payload"]["source"]) => Promise<void>;
} => {
  const { track } = useTracking();

  const [shouldDisablePlay, setShouldDisablePlay] = useState(false);
  const { triggerForceLoginPlayGame } = useForceLoginProvider();

  const play = useCallback(
    async (source: InitStartPlayGame["payload"]["source"]): Promise<void> => {
      const localGameInfo = await window.api.store_getGameInfo(clientId);
      if (!localGameInfo) return;
      if (shouldUpdateGame(localGameInfo.internalVersion, gameUpdateInfo)) {
        return;
      }

      const result = await triggerForceLoginPlayGame(
        {
          name: "PLAY_NATIVE_GAME",
          payload: {
            gameClientId: clientId,
          },
        },
        authType,
      );
      if (result === "can-not-continue") return;

      if (authType !== "nexus") {
        // make sure user don't accidentally open multiple game windows
        setShouldDisablePlay(true);

        setTimeout(() => {
          // We should allow user to open multiple windows for the same game so we don't need to disable this for now
          setShouldDisablePlay(false);
        }, 3000);
      }
      track({
        name: "init_start_play_game",
        payload: {
          gameId: clientId,
          source,
        },
      });
      const params: PlayNativeGameParams = {
        authType: authType,
        payload: { gameClientId: clientId, metadata },
      };

      void window.api.game_playNativeGame(params);
    },
    [clientId, gameUpdateInfo, triggerForceLoginPlayGame, authType, track, metadata],
  );

  const getGameSessionStatus = useCallback(async () => {
    const status = await window.api.game_getGameSessionStatus(clientId);
    setShouldDisablePlay(status === "fetching-session" || status === "running");
  }, [clientId]);

  const { addGameStartSubscriber } = useSubscribeToGameStart(clientId);
  const { addGamePiiAwaitingSubscriber } = useSubscribeToGamePiiAwaiting(clientId);
  const { addGameTerminateSubscriber } = useSubscribeToGameTermination(clientId);

  const isUnmounted = useIsUnmountedRef();
  useLayoutEffect(() => {
    if (isUnmounted.current) return;

    void getGameSessionStatus();
  }, [getGameSessionStatus, isUnmounted]);

  useLayoutEffect(() => {
    const unsubscribeGameStart = addGameStartSubscriber(() => {
      setShouldDisablePlay(true);
    });

    const unsubscribeGamePiiAwaiting = addGamePiiAwaitingSubscriber(() => {
      setShouldDisablePlay(false);
    });

    const unsubscribeGameTerminate = addGameTerminateSubscriber(() => {
      setShouldDisablePlay(false);
    });

    return (): void => {
      unsubscribeGameStart();
      unsubscribeGameTerminate();
      unsubscribeGamePiiAwaiting();
    };
  }, [track, addGameStartSubscriber, addGameTerminateSubscriber, addGamePiiAwaitingSubscriber]);

  const { t } = useTranslation();
  const textShouldDisablePlay =
    authType === "nexus" ? t("actions.isPlaying") : t("actions.playNow");

  return {
    shouldDisablePlay,
    textShouldDisablePlay,
    play: shouldDisablePlay
      ? async (): Promise<void> => {
          console.log("TRIGGER DISABLED PLAY");
        }
      : play,
  };
};

export default useGameActions;
