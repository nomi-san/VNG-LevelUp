import { ipcMain, type WebContentsView } from "electron";

import {
  FROM_NODE_FORCE_NAVIGATE_TO_HOME,
  FROM_NODE_PAGE_ACCOUNT_UPDATE_NAVIGATION,
  FROM_RENDERER_PAGE_ACCOUNT_BACK,
  FROM_RENDERER_PAGE_ACCOUNT_FORWARD,
  FROM_RENDERER_PAGE_ACCOUNT_MOUNT,
  FROM_RENDERER_PAGE_ACCOUNT_UNMOUNT,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import type { CanGo } from "@src/types/window-arranger";

import { envNode } from "./env-node";
import launcherStore from "./store";
import {
  callVerifySessionToGetLauncherUser,
  clearSessionOnRenderer,
  restrictOpenWindowHandler,
} from "./utils";

const accountDomain = `https://${envNode.myAccount}?hide_header=true&lang=vi`;

export const handleAccount = ({
  appContentView,
  accountView,
  onMount,
  onUnmount,
}: {
  appContentView: WebContentsView;
  accountView: WebContentsView;
  onMount: () => void;
  onUnmount: () => void;
}): WebContentsView => {
  restrictOpenWindowHandler(accountView.webContents);

  ipcMain.on(FROM_RENDERER_PAGE_ACCOUNT_MOUNT, () => {
    onMount();
    accountView.webContents
      .loadURL(accountDomain)
      .then(() => {
        nodeLogger.debug("account loaded");
      })
      .catch((error) => {
        nodeLogger.error(error, "Failed to load account");
      });

    // accountView.webContents.openDevTools();
  });
  accountView.webContents.on("did-navigate", async (_, url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.origin === envNode.loginPageOrigin) {
        const session = launcherStore.getUserSession();
        const launcherUser = await callVerifySessionToGetLauncherUser(appContentView, session);
        if (!launcherUser) {
          clearSessionOnRenderer(appContentView);
        }
        appContentView.webContents.send(FROM_NODE_FORCE_NAVIGATE_TO_HOME);
        onUnmount();
      }
    } catch (error) {
      nodeLogger.debug(error);
    }
  });

  ipcMain.on(FROM_RENDERER_PAGE_ACCOUNT_UNMOUNT, () => {
    onUnmount();
  });

  ipcMain.handle(FROM_RENDERER_PAGE_ACCOUNT_BACK, () => {
    return "should-unmount";
  });

  ipcMain.handle(FROM_RENDERER_PAGE_ACCOUNT_FORWARD, () => {
    accountView.webContents.goForward();
  });

  accountView.webContents.on("did-navigate-in-page", async () => {
    const canGo: CanGo = {
      back: accountView.webContents.canGoBack(),
      forward: accountView.webContents.canGoForward(),
    };

    appContentView.webContents.send(FROM_NODE_PAGE_ACCOUNT_UPDATE_NAVIGATION, canGo);
  });
  return accountView;
};
