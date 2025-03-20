import {
  app,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  Tray,
  type BrowserWindow,
  type WebContentsView,
} from "electron";

import {
  FROM_NODE_WARN_USER_TO_CHECK_DOWNLOADS_WHEN_CLOSING_APP,
  FROM_RENDERER_APP_ATTEMPT_TO_CLOSE,
  FROM_RENDERER_APP_CLOSE,
  FROM_RENDERER_APP_MINIMIZE,
  FROM_RENDERER_APP_MINIMIZE_TO_TRAY,
} from "@src/const/events";
import { cancelAllDownloadsInProgressAndCleanUpFolders } from "@src/main/download/download-progress";
import { makeDownloadProgressInfos } from "@src/main/download/map";
import { envNode } from "@src/main/env-node";

import notiImage from "../../resources/icon.ico?asset";
import launcherStore from "./store";

// Originally, The value is false,
// However, we want to close the app after every test so we have to allow exit
// TODO: Come up with a better solution for this
let allowed_to_exit = envNode.isInAutoTestEnvironment ? true : false;
let tray: Tray;

const handleClose = (): void => {
  allowed_to_exit = true;
  cancelAllDownloadsInProgressAndCleanUpFolders();
  app.quit();
};

const handleMinimizeToTray = (mainWindow: BrowserWindow): void => {
  const permission = launcherStore.getNotificationPermission();
  const hasMinimizeToTrayNoti = launcherStore.getHasMinimizeToTrayNoti();
  if (permission === "GRANTED" && !hasMinimizeToTrayNoti) {
    launcherStore.setHasMinimizeToTrayNoti();

    new Notification({
      title: "Level Up",
      body: "Level Up đã được thu nhỏ xuống thanh tác vụ.",
      icon: nativeImage.createFromPath(notiImage),
    }).show();
  }
  mainWindow.hide();
};

const handleAttemptToCloseApp = (
  mainWindow: BrowserWindow,
  appContentView: WebContentsView,
  ignoreMinimizeToTray: boolean = false,
) => {
  const downloads = makeDownloadProgressInfos();

  // TODO: This might cause some inconsistencies
  const isDownloading = downloads.some(
    (download) =>
      download.progress.some(({ download }) => download.status === "progressing") ||
      download.progress.some(({ install }) => install.status === "Unziping"),
  );

  if (!ignoreMinimizeToTray && launcherStore.getCloseSetting() === "MINIMIZE_TO_TRAY") {
    handleMinimizeToTray(mainWindow);
  } else if (isDownloading) {
    mainWindow.show();
    appContentView.webContents.send(FROM_NODE_WARN_USER_TO_CHECK_DOWNLOADS_WHEN_CLOSING_APP);
  } else {
    handleClose();
  }
};

export const handleTrayAndWindow = (
  mainWindow: BrowserWindow,
  appContentView: WebContentsView,
): void => {
  void app.whenReady().then(() => {
    tray = new Tray(nativeImage.createFromPath(notiImage));
    if (!tray) return;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Quit",
        click: (): void => {
          handleAttemptToCloseApp(mainWindow, appContentView, true);
        },
      },
    ]);
    tray.setToolTip("Level Up Launcher");
    tray.setContextMenu(contextMenu);

    tray.on("click", () => {
      mainWindow.show();
    });
  });

  ipcMain.on(FROM_RENDERER_APP_ATTEMPT_TO_CLOSE, () => {
    handleAttemptToCloseApp(mainWindow, appContentView);
  });

  ipcMain.on(FROM_RENDERER_APP_CLOSE, () => {
    handleClose();
  });

  ipcMain.on(FROM_RENDERER_APP_MINIMIZE, () => {
    mainWindow.minimize();
  });

  ipcMain.on(FROM_RENDERER_APP_MINIMIZE_TO_TRAY, () => {
    handleMinimizeToTray(mainWindow);
  });

  mainWindow.on("close", (e) => {
    if (!allowed_to_exit) {
      handleAttemptToCloseApp(mainWindow, appContentView);
      e.preventDefault();
    }
  });
};
