import { ipcMain, type WebContentsView } from "electron";

import { FROM_RENDERER_RECONNECT_TO_NETWORK } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";

import launcherStore from "./store";
import {
  callGetUserInfoAndUpdateSessionOnRenderer,
  callVerifySessionToGetLauncherUser,
  clearSessionOnRenderer,
} from "./utils";

export const handleReconnectToNetwork = (
  accountView: WebContentsView,
  webShopView: WebContentsView,
  appContentView: WebContentsView,
): void => {
  ipcMain.on(FROM_RENDERER_RECONNECT_TO_NETWORK, async () => {
    nodeLogger.debug("FROM_RENDERER_RECONNECT_TO_NETWORK was called");
    const session = launcherStore.getUserSession();
    if (!session) {
      clearSessionOnRenderer(appContentView);
      return;
    }
    const launcherUser = await callVerifySessionToGetLauncherUser(appContentView, session);
    if (!launcherUser) {
      clearSessionOnRenderer(appContentView);
      return;
    }
    await callGetUserInfoAndUpdateSessionOnRenderer(
      session,
      appContentView,
      accountView,
      webShopView,
      launcherUser,
    );
  });
};
