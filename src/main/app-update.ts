import { is } from "@electron-toolkit/utils";
import { ipcMain, type WebContentsView } from "electron";
import electronUpdater, { type AppUpdater } from "electron-updater";

import {
  FROM_NODE_APP_UPDATE_EVENT,
  FROM_RENDERER_APP_CHECK_FOR_UPDATE,
  FROM_RENDERER_APP_TRIGGER_DOWNLOAD_UPDATE,
  FROM_RENDERER_APP_TRIGGER_INSTALL_UPDATE,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";

export function getAutoUpdater(): AppUpdater {
  // Using destructuring to access autoUpdater due to the CommonJS module of 'electron-updater'.
  // It is a workaround for ESM compatibility issues, see https://github.com/electron-userland/electron-builder/issues/7976.
  const { autoUpdater } = electronUpdater;
  return autoUpdater;
}

const app = require("electron").app;

const FIFTEEEN_MINUTES = 1000 * 60 * 15;
Object.defineProperty(app, "isPackaged", {
  get() {
    return true;
  },
});

const handleAppUpdate = (appContentView: WebContentsView): void => {
  if (is.dev) return;

  const autoUpdater = getAutoUpdater();

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.requestHeaders = {
    "PRIVATE-TOKEN": "<token>",
  };

  void autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => {
    void autoUpdater.checkForUpdatesAndNotify();
  }, FIFTEEEN_MINUTES);

  ipcMain.on(FROM_RENDERER_APP_CHECK_FOR_UPDATE, async () => {
    console.log("checkingForUpdate");
    void autoUpdater.checkForUpdatesAndNotify();
    //const updateCheckResult = await autoUpdater.checkForUpdates();
    //
    //nodeLogger.log("Update check result: ", updateCheckResult);
  });

  ipcMain.on(FROM_RENDERER_APP_TRIGGER_DOWNLOAD_UPDATE, () => {
    try {
      autoUpdater
        .downloadUpdate()
        .then((downloadResult) => {
          nodeLogger.log(downloadResult);
        })
        .catch((err) => {
          nodeLogger.error(err, "Error downloading update");
        });
    } catch (err) {
      nodeLogger.error(err, "Error downloading update");
    }
  });
  ipcMain.on(FROM_RENDERER_APP_TRIGGER_INSTALL_UPDATE, () => {
    autoUpdater.quitAndInstall();
  });

  autoUpdater.on("login", (authInfo) => {
    nodeLogger.debug("login", authInfo);

    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "login",
      details: authInfo,
    });
  });
  autoUpdater.on("checking-for-update", () => {
    nodeLogger.log("checking-for-update");
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "checking-for-update",
    });
  });
  autoUpdater.on("update-available", (info) => {
    nodeLogger.log("update-available", info);
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "update-available",
      details: info,
    });
  });
  autoUpdater.on("update-not-available", (info) => {
    nodeLogger.log("update-not-available", info);
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "update-not-available",
      details: info,
    });
  });
  autoUpdater.on("update-cancelled", (info) => {
    nodeLogger.log("update-cancelled", info);
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "update-cancelled",
      details: info,
    });
  });
  autoUpdater.on("download-progress", (progress) => {
    nodeLogger.log("download-progress", progress);
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "download-progress",
      details: progress,
    });
  });
  autoUpdater.on("update-downloaded", (info) => {
    nodeLogger.log("update-downloaded", info);
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "update-downloaded",
      details: info,
    });
  });
  autoUpdater.on("error", (err) => {
    nodeLogger.log("error", err);
    appContentView.webContents.send(FROM_NODE_APP_UPDATE_EVENT, {
      event: "error",
      details: err,
    });
  });
};

export default handleAppUpdate;
