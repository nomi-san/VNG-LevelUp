import { ipcMain, type WebContentsView } from "electron";

import {
  FROM_NODE_ON_AWAIT_FOR_PII_NATIVE_GAME,
  FROM_NODE_ON_START_NATIVE_GAME,
  FROM_NODE_ON_STOP_NATIVE_GAME,
  FROM_NODE_TRIGGER_SURVEY,
  FROM_RENDERER_GET_GAME_SESSION_STATUS,
  FROM_RENDERER_START_NATIVE_GAME,
  FROM_RENDERER_SUBMIT_SURVEY_QUESTION_ANSWER,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { callPostGetGameSession } from "@src/main/api/GameSession.api";
import { GAME_SESSION_OAUTH_URI_DEEP_LINK } from "@src/main/const/auth";
import { SSOGameSession } from "@src/main/GameSession/SSOGameSession";
import {
  generateCodeChallengeForGameSession,
  generateCodeVerifier,
  generateState,
  type GeneratedState,
} from "@src/main/utils/crypto";
import type { CommonEventParams } from "@src/types/common";
import type { DetailsPageGameInfo, GameClientId, LocalGameInfoV3 } from "@src/types/game";
import type {
  GameSessionId,
  GameSessionStatus,
  OnStartStopGameParams,
  PlayGameStateInfo,
  PlayNativeGameParams,
} from "@src/types/native-game";

import { DetachedGameSession } from "./GameSession/DetachedGameSession";
import {
  notifyRendererToPiiDeclareSuccessful,
  notifyRendererToTriggerPiiDeclare,
} from "./pii-declare";
import launcherStore from "./store";
import { validateGame } from "./utils";

const noOp = (): void => {};
const emptyState = "";
const AWAITING_FOR_PII_TIMEOUT = 1000 * 60 * 15;

const gameSessionsToTriggerSurvey = [2, 5, 10];
const triggerSurveyIfNeeded = (appContentView: WebContentsView): void => {
  const userHasNotDoneSurvey =
    launcherStore.getAmountOfGameSessionsPlayedBeforeCompletetingLocalSurvey() <= 0;

  const amountOfGameSessions = launcherStore.increaseAmountOfGameSessionsPlayed();
  if (userHasNotDoneSurvey && gameSessionsToTriggerSurvey.includes(amountOfGameSessions)) {
    appContentView.webContents.send(FROM_NODE_TRIGGER_SURVEY);
  }
};

type OneSessionOfSessionSyncedGame = {
  session: SSOGameSession | null;
  status: GameSessionStatus;
  resolveCode: (code: string) => void;
  state: GeneratedState;
  userSessionOwner: string;
};

type OneSessionOfDetachedGame = {
  session: DetachedGameSession;
  status: GameSessionStatus;
};
type OneSessionOfOneGame = OneSessionOfSessionSyncedGame | OneSessionOfDetachedGame;

type ManySessionsOfOneGame = Record<GameSessionId, OneSessionOfOneGame>;
type GameSessionsMap = Record<GameClientId, ManySessionsOfOneGame>;

const gameSessionsMap: GameSessionsMap = {};
const isGameBeingPlayed = (sessionsOfOneGame: ManySessionsOfOneGame): boolean =>
  Object.values(sessionsOfOneGame).some(
    ({ status }) => status === "running" || status === "fetching-session",
  );

const getGameSessionSafely = (
  gameClientId: GameClientId,
  sessionId: GameSessionId,
): OneSessionOfOneGame | undefined => {
  const manySessionsOfOneGame = gameSessionsMap[gameClientId];
  if (!manySessionsOfOneGame) return;
  const oneSessionOfOneGame = manySessionsOfOneGame[sessionId];
  if (!oneSessionOfOneGame) return;

  return oneSessionOfOneGame;
};

const handleNativeGame = (appContentView: WebContentsView): void => {
  ipcMain.handle(
    FROM_RENDERER_GET_GAME_SESSION_STATUS,
    (_, { clientId }: CommonEventParams): GameSessionStatus => {
      if (!gameSessionsMap[clientId]) {
        return "terminated";
      }

      const sessions = gameSessionsMap[clientId];

      // TODO: actually sometimes it's awaiting for pii
      return isGameBeingPlayed(sessions) ? "running" : "terminated";
    },
  );

  ipcMain.handle(
    FROM_RENDERER_START_NATIVE_GAME,
    async (_, { authType, payload: { gameClientId, metadata } }: PlayNativeGameParams) => {
      nodeLogger.log("Starting native game", authType, gameClientId);
      if (gameSessionsMap[gameClientId] && isGameBeingPlayed(gameSessionsMap[gameClientId])) return;

      if (!validateGame(gameClientId)) {
        nodeLogger.log("Game file is not valid");
        launcherStore.clearGameInfo(gameClientId);
        return;
      }

      const localGameInfo = launcherStore.getGameInfo(gameClientId);
      if (!localGameInfo) return;

      const sessionId: GameSessionId = Date.now().toString();
      nodeLogger.log("game session id", sessionId);
      const params: OnStartStopGameParams = { clientId: gameClientId, sessionId };

      if (
        localGameInfo.internalVersion !== "legacy" &&
        (authType === "nexus" || authType === "signin")
      ) {
        void handleNativeGameSession({
          gameClientId,
          localGameInfo,
          sessionId,
          params,
        });
      } else if (authType === "none") {
        handleDetachedGameSession({ metadata, localGameInfo, sessionId, gameClientId, params });
      }
    },
  );

  const handleNativeGameSession = async ({
    gameClientId,
    localGameInfo,
    sessionId,
    params,
  }: {
    gameClientId: GameClientId;
    localGameInfo: LocalGameInfoV3;
    sessionId: GameSessionId;
    params: OnStartStopGameParams;
  }) => {
    const gameSession = startANewGameSession({
      gameClientId,
      sessionId,
      params,
      localGameInfo,
    });
    const userSession = launcherStore.getUserSession();
    const newSession: OneSessionOfSessionSyncedGame = {
      session: gameSession,
      status: "fetching-session",
      state: emptyState,
      resolveCode: noOp,
      userSessionOwner: userSession,
    };
    gameSessionsMap[gameClientId] = {
      [sessionId]: newSession,
    };

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallengeForGameSession(codeVerifier);

    nodeLogger.log("code codeVerifier: ", codeVerifier);
    nodeLogger.log("code codeChallenge: ", codeChallenge);

    const stateParams: PlayGameStateInfo = {
      name: "RESOLVE_GAME_OAUTH_CODE",
      sessionId,
      gameClientId,
    };
    const state = generateState(stateParams);
    const result = await callPostGetGameSession(appContentView, {
      codeChallenge,
      userSession,
      gameClientId: gameClientId,
      state,
    });

    nodeLogger.log("callPostGetGameSession result", result);

    const { redirectUrl } = result;

    let code: string | undefined;

    const cleanUp = () => {
      const manySessionsOfOneGame = gameSessionsMap[gameClientId];
      if (!manySessionsOfOneGame) return;
      delete manySessionsOfOneGame[sessionId];
    };
    if (redirectUrl) {
      notifyRendererToTriggerPiiDeclare(appContentView, redirectUrl);

      const oneSessionOfOneGame = getGameSessionSafely(
        gameClientId,
        sessionId,
      ) as OneSessionOfSessionSyncedGame;

      oneSessionOfOneGame.state = state;
      oneSessionOfOneGame.status = "awaiting-pii-submission";
      appContentView.webContents.send(FROM_NODE_ON_AWAIT_FOR_PII_NATIVE_GAME, params);

      nodeLogger.log("awaiting for code for game ");
      code = await new Promise<string | undefined>((resolve) => {
        oneSessionOfOneGame.resolveCode = resolve;

        setTimeout(() => {
          if (oneSessionOfOneGame.status !== "awaiting-pii-submission") return;
          cleanUp();
        }, AWAITING_FOR_PII_TIMEOUT);
      });

      if (!code) {
        cleanUp();
        return;
      }

      notifyRendererToPiiDeclareSuccessful(appContentView);
    } else {
      code = result.code;

      if (!code) {
        cleanUp();
        return;
      }
    }

    nodeLogger.log("start game session with code: ", code);
    appContentView.webContents.send(FROM_NODE_ON_START_NATIVE_GAME, params);

    await gameSession.start({
      codeChallenge,
      codeVerifier,
      code,
    });
  };

  const startANewGameSession = ({
    gameClientId,
    sessionId,
    params,
    localGameInfo,
  }: {
    gameClientId: GameClientId;
    sessionId: GameSessionId;
    params: OnStartStopGameParams;
    localGameInfo: LocalGameInfoV3;
  }): SSOGameSession => {
    const onTerminate = () => {
      appContentView.webContents.send(FROM_NODE_ON_STOP_NATIVE_GAME, params);
      const oneSessionOfOneGame = getGameSessionSafely(gameClientId, sessionId);

      if (!oneSessionOfOneGame) return;

      oneSessionOfOneGame.status = "terminated";
    };
    const gameSession = new SSOGameSession({
      gameClientId,
      filePath: localGameInfo.runnablePath,
      appDeeplink: GAME_SESSION_OAUTH_URI_DEEP_LINK,
      onTerminate: (): void => {
        nodeLogger.log("Game session terminated");

        onTerminate();

        triggerSurveyIfNeeded(appContentView);
      },
      onExecGame: (): void => {
        const oneSessionOfOneGame = getGameSessionSafely(gameClientId, sessionId);
        if (!oneSessionOfOneGame) return;

        oneSessionOfOneGame.status = "running";
      },
    });

    return gameSession;
  };

  const handleDetachedGameSession = ({
    metadata,
    localGameInfo,
    sessionId,
    gameClientId,
    params,
  }: {
    metadata: DetailsPageGameInfo["metadata"];
    localGameInfo: LocalGameInfoV3;
    sessionId: GameSessionId;
    gameClientId: GameClientId;
    params: OnStartStopGameParams;
  }) => {
    const startParams: string[] = metadata?.escapeStartCommand ? ["-"] : [];

    const gameSession = new DetachedGameSession({
      filePath: localGameInfo.runnablePath,
      onTerminate: (): void => {
        triggerSurveyIfNeeded(appContentView);

        appContentView.webContents.send(FROM_NODE_ON_STOP_NATIVE_GAME, params);
        const session = getGameSessionSafely(gameClientId, sessionId);
        if (!session) return;
        session.status = "terminated";
      },
      shouldExecAsAdmin: localGameInfo.internalVersion === "legacy",
    });

    nodeLogger.log("Starting detached game session");
    gameSession.start(startParams);
    gameSessionsMap[gameClientId] = {
      [sessionId]: {
        session: gameSession,
        status: "running",
      },
    };

    setTimeout(() => {
      // Hack to allow user to open multiple windows for the same game for now

      const oneSessionOfOneGame = getGameSessionSafely(gameClientId, sessionId);
      if (!oneSessionOfOneGame) return;
      oneSessionOfOneGame.status = "terminated";
    }, 2000);

    appContentView.webContents.send(FROM_NODE_ON_START_NATIVE_GAME, params);
  };

  ipcMain.on(FROM_RENDERER_SUBMIT_SURVEY_QUESTION_ANSWER, () => {
    launcherStore.setAmountOfGameSessionPlayedBeforeCompletingLocalSurvey();
  });
};

const resolveCodeForGameAfterPII = ({
  state,
  gameClientId,
  sessionId,
  code,
}: {
  state: GeneratedState;
  gameClientId: GameClientId;
  sessionId: GameSessionId;
  code: string;
}): boolean => {
  const gameSession = getGameSessionSafely(gameClientId, sessionId);
  nodeLogger.log("resolving code for session id", sessionId);

  if (!gameSession) return false;
  if (!("state" in gameSession)) return false;

  nodeLogger.log("diff states ", state, gameSession.state);

  if (gameSession.state !== state) return false;

  gameSession.resolveCode(code);
  nodeLogger.log("resolved code for session id successfully", sessionId);

  return true;
};

export { handleNativeGame, resolveCodeForGameAfterPII };
