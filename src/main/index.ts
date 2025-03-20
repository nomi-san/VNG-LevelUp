import { join } from "node:path";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import { app, BrowserWindow, ipcMain, shell } from "electron";
import { dialog } from "electron/main";

import {
  FROM_RENDERER_APP_GET_VERSION,
  FROM_RENDERER_DEEPLINK_REGISTER,
  FROM_RENDERER_DIALOG_SELECT_DIR,
  FROM_RENDERER_GET_GUEST_ID,
  FROM_RENDERER_OPEN_EXTERNAL_WEB,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { handleGameDownloadListener } from "@src/main/download/listener";
import { handleDownloadOnOpenApp } from "@src/main/download/on-open-app";
import type {
  DeepLinkRegisterParams,
  DirectoryInfo,
  SelectDirectoryAndAppendFolder,
} from "@src/types/system";

import { handleAnalytics } from "./analytics";
import { handleAppSettings } from "./app-setting";
import handleAppUpdate from "./app-update";
import { readDeepLinkFromSecondInstanceAndUpdateSession } from "./deeplink";
import { handleEmbeddedWebGame } from "./embedded-web-game";
import { handleFileLogger } from "./file-logger";
import { handleNativeGame } from "./game";
import { handleGameInfo } from "./game-info";
import handleMinigames from "./minigames";
import { initMonitoringMain } from "./monitoring";
import { handleReconnectToNetwork } from "./reconnect-network";
import handleRedeemCode from "./redeem";
import handleForwardRequestToRenderer from "./request-on-renderer";
import { handlePlayGameOnOpenApp, handleShortcut } from "./shortcut";
import launcherStore from "./store";
import { handleTrayAndWindow } from "./tray-and-window";
import { handleLoginAndLogoutEvent, handleUserSession, setupUserSession } from "./user-session";
import { checkForAvailableStorage } from "./utils";
import { createWindow } from "./window-arranger";

initMonitoringMain();

process.on("uncaughtException", function (err) {
  if (import.meta.env.MODE === "test") {
    nodeLogger.error(err, "uncaughtException");
    throw err;
  } else {
    //TODO: handle the error safely
    nodeLogger.error(err, "uncaughtException");
  }
});

void app.whenReady().then(async () => {
  launcherStore.setAppOpenTime();
  setupUserSession();
  ipcMain.handle(FROM_RENDERER_GET_GUEST_ID, () => {
    return launcherStore.getGuestId();
  });
  ipcMain.handle(FROM_RENDERER_APP_GET_VERSION, () => {
    return app.getVersion();
  });
  handleAnalytics();

  const { mainWindow, appContentView, webShopView, accountView, renderApp } = createWindow();
  handleForwardRequestToRenderer();
  handleFileLogger();
  handleRedeemCode();
  handleNativeGame(appContentView);
  handleGameInfo(appContentView);
  handleAppSettings();
  handleMinigames();
  handleGameDownloadListener(appContentView);
  enableSomeOSSpecificFeatures();

  await renderApp();

  await handleUserSession({ appContentView, accountView, webShopView });

  const { handlePlayGameFromProcessArgv } = handlePlayGameOnOpenApp(appContentView);
  handlePlayGameFromProcessArgv(process.argv);
  app.on("second-instance", (_, argv) => {
    if (mainWindow) {
      // Someone tried to run a second instance, we should focus our window.
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }

    handlePlayGameFromProcessArgv(argv);

    try {
      void readDeepLinkFromSecondInstanceAndUpdateSession(appContentView, argv);
    } catch (error) {
      nodeLogger.log(error, "readDeepLinkFromSecondInstanceAndUpdateSession");
    }
  });

  await handleDownloadOnOpenApp(appContentView);

  // The following functions are not essential to the app's first load
  // So we call them after renderApp to show the app UI as soon as possible

  handleLoginAndLogoutEvent(mainWindow, appContentView);

  ipcMain.handle(
    FROM_RENDERER_DEEPLINK_REGISTER,
    (_, { deeplink, gamePath }: DeepLinkRegisterParams) => {
      nodeLogger.debug("register deeplink", deeplink, gamePath);
      app.setAsDefaultProtocolClient(deeplink, gamePath);
    },
  );

  ipcMain.on(FROM_RENDERER_OPEN_EXTERNAL_WEB, (_, url: string) => {
    void shell.openExternal(url);
  });

  ipcMain.handle(
    FROM_RENDERER_DIALOG_SELECT_DIR,
    async (
      _,
      { directory }: SelectDirectoryAndAppendFolder,
    ): Promise<DirectoryInfo | undefined> => {
      const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        properties: ["openDirectory"],
      });

      if (canceled) {
        return undefined;
      } else {
        const availableStorage = await checkForAvailableStorage(filePaths[0]);
        const result: DirectoryInfo = {
          availableStorage,
          selectedDir: directory ? join(filePaths[0], directory) : filePaths[0],
        };
        return result;
      }
    },
  );
  // handleLocateGame();

  handleReconnectToNetwork(accountView, webShopView, appContentView);
  handleEmbeddedWebGame(mainWindow);

  handleTrayAndWindow(mainWindow, appContentView);

  handleAppUpdate(appContentView);

  handleShortcut();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const enableSomeOSSpecificFeatures = (): void => {
  // Set app user model id for windows
  electronApp.setAppUserModelId("Level Up Launcher");

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
};
