import { existsSync, statfs } from "node:fs";
import { shell, type WebContents, type WebContentsView } from "electron";

import { BaseFetchError } from "@src/const/error";
import { FROM_NODE_UPDATE_USER_SESSION } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { callGetVgaUser, callVerifySession } from "@src/main/api/Profile.api";
import { decodeState } from "@src/main/utils/crypto";
import type { LoginStateInfo, UpdateUserSessionParams } from "@src/types/auth";
import type { AvailableStorage } from "@src/types/system";
import type { LauncherUser } from "@src/types/user";

import { envNode } from "./env-node";
import { getGlobalLoginInfo, updateGlobalLoginInfo } from "./shared";
import launcherStore from "./store";

export const callGetUserInfoAndUpdateSessionOnRenderer = async (
  session: string,
  appContentView: WebContentsView,
  accountView: WebContentsView,
  webshopContentView: WebContentsView,
  launcherUser: LauncherUser,
): Promise<void> => {
  const state = getGlobalLoginInfo()?.state;
  updateGlobalLoginInfo(undefined);
  try {
    const vgaUser = await callGetVgaUser(session);
    if (!vgaUser) {
      nodeLogger.error("User not found after logging in");
      launcherStore.setUserSession("");
      appContentView.webContents.send(FROM_NODE_UPDATE_USER_SESSION, {
        session: "",
        user: null,
        launcherUser: null,
      });
      return;
    }

    launcherStore.setUserSession(session);
    const decodedState = state ? (decodeState(state) as LoginStateInfo) : null;
    const params: UpdateUserSessionParams = {
      session,
      vgaUser,
      ...(decodedState ? { state: decodedState } : {}),
      launcherUser,
    };
    nodeLogger.setUser({
      guestId: launcherStore.getGuestId(),
      ggId: vgaUser.ggId,
      launcherUserId: launcherUser?.userId || "",
    });
    appContentView.webContents.send(FROM_NODE_UPDATE_USER_SESSION, params);

    await accountView.webContents.session.cookies.set({
      url: `https://${envNode.myAccount}`,
      domain: envNode.myAccountWildcard,
      httpOnly: true,
      name: "shared_ecn_session",
      path: "/",
      sameSite: undefined,
      secure: true,
      value: session,
    });
    await webshopContentView.webContents.session.cookies.set({
      url: `https://${envNode.webshop}`,
      domain: envNode.webshopCookieWildcard,
      httpOnly: true,
      name: "shared_ecn_session",
      path: "/",
      sameSite: undefined,
      secure: true,
      value: session,
    });
  } catch (error) {
    nodeLogger.error(error, "callGetUserInfoAndUpdateSessionOnRenderer", session);
    if (
      error &&
      error instanceof BaseFetchError &&
      (error.code === "unauthorized" || error.code === "session_not_found")
    ) {
      if (session) {
        launcherStore.setUserSession("");
      }
      clearSessionOnRenderer(appContentView);
    }
  }
};

export const callVerifySessionToGetLauncherUser = async (
  appContentView: WebContentsView,
  session: string,
): Promise<LauncherUser | null> => {
  try {
    const launcherUser = await callVerifySession(appContentView, session);
    return launcherUser;
  } catch (error: unknown) {
    // no need to .error because the session expiring is a normal behavior
    nodeLogger.log(
      error,
      `checkUserSessionAndUpdateSessionOnRenderer | Error`,
      error instanceof BaseFetchError && error.code === "unauthorized",
    );
    if (error instanceof BaseFetchError && error.message === "unauthorized") {
      launcherStore.setUserSession("");
    }
    return null;
  }
};

export const FREE_SPACE_THRESHOLD = 2048 * 10; // 20MB,  It seems to never go above 20MB during testing
export function checkForAvailableStorage(gamePath: string): Promise<AvailableStorage> {
  return new Promise((resolve) => {
    // TODO: Double check the slash for other OS
    const pathToCheck = gamePath.split("\\")[0] + "\\";
    nodeLogger.debug("Path to check", pathToCheck);
    statfs(pathToCheck, (err, stats) => {
      if (err) {
        throw err;
      }
      nodeLogger.debug("Total free space", stats.bsize * stats.bfree);
      nodeLogger.debug("Available for user", stats.bsize * stats.bavail);

      const totalFreeSpace = stats.bsize * stats.bfree;
      const diskSpaceAvailableForUser = stats.bsize * stats.bavail;

      resolve({ totalFreeSpace, diskSpaceAvailableForUser });
    });
  });
}

export const validateGame = (clientId: string): boolean => {
  // TODO: check md5

  const gameInfo = launcherStore.getGameInfo(clientId);
  if (!gameInfo) return false;

  const gamePath = gameInfo.runnablePath;

  return existsSync(gamePath);
};

export const restrictOpenWindowHandler = (webcontent: WebContents): void => {
  webcontent.setWindowOpenHandler((details) => {
    nodeLogger.debug("[OPEN NEW WINDOW RESTRICT HANDLER]", details);
    void shell.openExternal(details.url);
    return { action: "deny" };
  });
};

export const clearSessionOnRenderer = (appContentView: WebContentsView): void => {
  appContentView.webContents.send(FROM_NODE_UPDATE_USER_SESSION, {
    session: "",
    user: null,
    launcherUser: null,
  });
};
