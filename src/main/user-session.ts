import { ipcMain, shell, type BrowserWindow, type WebContentsView } from "electron";

import {
  FROM_NODE_UPDATE_IS_VALIDATING_SESSION,
  FROM_NODE_UPDATE_USER_SESSION,
  FROM_RENDERER_GET_USER_SESSION,
  FROM_RENDERER_LOGIN_PAGE_MOUNT,
  FROM_RENDERER_USER_LOGOUT,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { buildLoginUrl, callGetLogout, callHeartBeat } from "@src/main/api/Profile.api";
import {
  ALLOW_ALL_METHODS,
  CODE_CHALLENGE_METHOD,
  LOGIN_OAUTH_URI,
  SERVICE_ID,
  SESSION_CHECK_INTERVAL,
} from "@src/main/const/auth";
import {
  generateCodeChallengeForLogin,
  generateCodeVerifier,
  generateState,
} from "@src/main/utils/crypto";
import type { BuildLoginInfo, LoginStateInfo } from "@src/types/auth";
import type { UserSessionInfo } from "@src/types/system";
import type { LauncherUser } from "@src/types/user";

import { updateGlobalLoginInfo } from "./shared";
import launcherStore from "./store";
import {
  callGetUserInfoAndUpdateSessionOnRenderer,
  callVerifySessionToGetLauncherUser,
  clearSessionOnRenderer,
} from "./utils";

export const handleLoginAndLogoutEvent = (
  _mainWindow: BrowserWindow,
  appContentView: WebContentsView,
): void => {
  ipcMain.handle(FROM_RENDERER_LOGIN_PAGE_MOUNT, (_, params: LoginStateInfo) => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallengeForLogin(codeVerifier);
    const state = generateState(params);
    const lang = "vi";

    const data: BuildLoginInfo = {
      serviceId: SERVICE_ID,
      redirectUri: LOGIN_OAUTH_URI,
      codeChallenge,
      codeChallengeMethod: CODE_CHALLENGE_METHOD,
      state,
      authMethod: ALLOW_ALL_METHODS,
      lang,
    };
    const storedData: BuildLoginInfo = {
      ...data,
      codeVerifier,
    };
    updateGlobalLoginInfo(storedData);
    const url = buildLoginUrl(data);
    nodeLogger.log("url", url);
    void shell.openExternal(url);
  });

  ipcMain.on(FROM_RENDERER_USER_LOGOUT, async () => {
    try {
      await callGetLogout(appContentView);
    } catch (error) {
      nodeLogger.error(error, "[ERROR while logging out]");
    }
    launcherStore.setUserSession("");
    appContentView.webContents.send(FROM_NODE_UPDATE_USER_SESSION, {
      session: "",
      user: null,
      launcherUser: null,
    });
  });
};

let isValidatingSession = true;
export const onStartVerifySession = (appContentView: WebContentsView): void => {
  nodeLogger.log("Verifing session");
  isValidatingSession = true;
  appContentView.webContents.send(FROM_NODE_UPDATE_IS_VALIDATING_SESSION, isValidatingSession);
};

export const setupUserSession = (): void => {
  ipcMain.handle(FROM_RENDERER_GET_USER_SESSION, () => {
    const guestId = launcherStore.getGuestId();
    const result: UserSessionInfo = {
      session: launcherStore.getUserSession(),
      guestId,
      isValidatingSession,
    };
    return result;
  });
};
export const handleUserSession = async ({
  appContentView,
  accountView,
  webShopView,
}: {
  appContentView: WebContentsView;
  accountView: WebContentsView;
  webShopView: WebContentsView;
}): Promise<void> => {
  let session = launcherStore.getUserSession();
  let launcherUser: LauncherUser | null = null;
  isValidatingSession = Boolean(session);

  const setSessionOnRenderer = async (
    newSession: string,
    newLauncherUser: LauncherUser | null,
  ): Promise<void> => {
    if (!newLauncherUser || !newSession) {
      clearSessionOnRenderer(appContentView);
      return;
    }

    if (launcherUser && session === newSession) return;

    session = newSession;
    launcherUser = newLauncherUser;

    await callGetUserInfoAndUpdateSessionOnRenderer(
      newSession,
      appContentView,
      accountView,
      webShopView,
      newLauncherUser,
    );
  };
  const onFinishVerifySession = async (
    newSession: string,
    newLauncherUser: LauncherUser | null,
  ): Promise<void> => {
    nodeLogger.log("Finished verifying session");
    await setSessionOnRenderer(newSession, newLauncherUser);
    isValidatingSession = false;
    appContentView.webContents.send(FROM_NODE_UPDATE_IS_VALIDATING_SESSION, isValidatingSession);
  };

  const onStartHeartbeat = () => {
    isValidatingSession = false;
    appContentView.webContents.send(FROM_NODE_UPDATE_IS_VALIDATING_SESSION, isValidatingSession);
  };

  if (!session) {
    void startHeartbeat(appContentView, onStartHeartbeat);
  } else {
    void startVerifySession(appContentView, onStartVerifySession, onFinishVerifySession);
  }
  launcherStore.setOnUpdateUserSession(() => {
    void startVerifySession(appContentView, onStartVerifySession, onFinishVerifySession);
  });
  launcherStore.setOnClearUserSession(() => {
    void startHeartbeat(appContentView, onStartHeartbeat);
  });
};

const startVerifySession = async (
  appContentView: WebContentsView,
  onStartVerify: (appContentView: WebContentsView) => void,
  onFinishVerify: (newSession: string, launcherUser: LauncherUser | null) => void,
): Promise<void> => {
  for (;;) {
    onStartVerify(appContentView);
    const session = launcherStore.getUserSession();
    if (!session) {
      onFinishVerify("", null);
      return;
    }

    const launcherUser = await callVerifySessionToGetLauncherUser(appContentView, session);

    onFinishVerify(session, launcherUser);
    await waitForSeconds(SESSION_CHECK_INTERVAL);
  }
};

const startHeartbeat = async (
  appContentView: WebContentsView,
  onStartHeartbeat: () => void,
): Promise<void> => {
  onStartHeartbeat();
  let nextCallInSeconds = 0;
  for (;;) {
    const data = await callHeartBeat(appContentView);
    nodeLogger.log("Heartbeat", data);

    if (!data) nextCallInSeconds = 60;

    if (data.nextCallInSeconds === "STOP_CALLING") return;

    nextCallInSeconds = data.nextCallInSeconds;

    await waitForSeconds(nextCallInSeconds);
  }
};

function waitForSeconds(x: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, x * 1000);
  });
}
