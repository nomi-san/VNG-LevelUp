import { useCallback, useEffect, useRef } from "react";

import {
  FROM_NODE_ON_AWAIT_FOR_PII_NATIVE_GAME,
  FROM_NODE_ON_START_NATIVE_GAME,
  FROM_NODE_ON_STOP_NATIVE_GAME,
} from "@src/const/events";
import type { GameClientId } from "@src/types/game";
import type { OnStartStopGameParams } from "@src/types/native-game";

const gameStartSubscribers: Record<
  GameClientId,
  Record<string, (params: OnStartStopGameParams) => void>
> = {};
export const useSetUpGameStartSubscriber = () => {
  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_ON_START_NATIVE_GAME,
      (_, params: OnStartStopGameParams) => {
        const clientId = params.clientId;
        if (!gameStartSubscribers[clientId]) return;
        Object.values(gameStartSubscribers[clientId]).forEach((onStart) => {
          onStart(params);
        });
      },
    );
  }, []);
};
export const useSubscribeToGameStart = (gameClientId: GameClientId) => {
  const addGameStartSubscriber = useCallback(
    (onStart: (params: OnStartStopGameParams) => void) => {
      if (!gameStartSubscribers[gameClientId])
        gameStartSubscribers[gameClientId] = {} as (typeof gameStartSubscribers)[GameClientId];

      const id = Math.random().toString(36).slice(2);
      gameStartSubscribers[gameClientId][id] = onStart;

      return (): void => {
        delete gameStartSubscribers[gameClientId][id];
      };
    },
    [gameClientId],
  );

  return { addGameStartSubscriber };
};

export const useSubscribeToGamePiiAwaiting = (gameClientId: GameClientId) => {
  const subscribers = useRef<
    Record<GameClientId, Record<string, (params: OnStartStopGameParams) => void>>
  >({});

  const addGamePiiAwaitingSubscriber = useCallback(
    (onAwaitForPii: (params: OnStartStopGameParams) => void) => {
      if (!subscribers.current[gameClientId]) subscribers.current[gameClientId] = {};

      const id = Math.random().toString();

      subscribers.current[gameClientId][id] = onAwaitForPii;

      return (): void => {
        delete subscribers.current[gameClientId][id];
      };
    },
    [gameClientId],
  );

  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_ON_AWAIT_FOR_PII_NATIVE_GAME,
      (_, params: OnStartStopGameParams) => {
        const clientId = params.clientId;
        if (!subscribers.current[clientId]) return;
        Object.values(subscribers.current[clientId]).forEach((onAwaitForPii) => {
          onAwaitForPii(params);
        });
      },
    );
  }, []);

  return { addGamePiiAwaitingSubscriber };
};

export const useSubscribeToGameTermination = (gameClientId: GameClientId) => {
  const subscribers = useRef<
    Record<GameClientId, Record<string, (params: OnStartStopGameParams) => void>>
  >({});

  const addGameTerminateSubscriber = useCallback(
    (onStop: (params: OnStartStopGameParams) => void) => {
      if (!subscribers.current[gameClientId]) subscribers.current[gameClientId] = {};

      const id = Math.random().toString();

      subscribers.current[gameClientId][id] = onStop;

      return (): void => {
        delete subscribers.current[gameClientId][id];
      };
    },
    [gameClientId],
  );

  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_ON_STOP_NATIVE_GAME,
      (_, params: OnStartStopGameParams) => {
        const clientId = params.clientId;
        if (!subscribers.current[clientId]) return;
        Object.values(subscribers.current[clientId]).forEach((onStop) => {
          onStop(params);
        });
      },
    );
  }, []);

  return { addGameTerminateSubscriber };
};
