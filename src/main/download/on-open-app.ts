import type { WebContentsView } from "electron";

import { FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { paramToTriggerDownloadGameOnLaunch } from "@src/main/const/game";
import launcherStore from "@src/main/store";
import { getArgv } from "@src/main/utils/node";
import type { CommonEventParams } from "@src/types/common";

export const handleDownloadOnOpenApp = async (appContentView: WebContentsView): Promise<void> => {
  const gameToDownloadOnStart = getArgv(paramToTriggerDownloadGameOnLaunch);

  nodeLogger.log("gameToDownloadOnStart", gameToDownloadOnStart);

  if (!gameToDownloadOnStart || typeof gameToDownloadOnStart !== "string") return;

  if (launcherStore.getGameInfo(gameToDownloadOnStart)) return;

  const params: CommonEventParams = { clientId: gameToDownloadOnStart };
  appContentView.webContents.send(
    FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG,
    params,
  );

  // Auto download the game
  // nodeLogger.log("Downloading game on start", gameToDownloadOnStart);
  // const remoteGameInfo = await callGetRemoteGameInfo(
  //   gameToDownloadOnStart,
  //   launcherStore.getUserSession(),
  // );
  //
  // // const defaultGameDir = getArgv(paramToSetDefaultGamesDir);
  // const defaultGameDir = "C:\\";
  // if (!defaultGameDir || typeof defaultGameDir !== "string") return;
  //
  // launcherStore.setDefaultGameDir(defaultGameDir);
  // downloadItemsMap.set(gameToDownloadOnStart, {
  //   info: {
  //     remoteGameInfo,
  //     properties: { directory: defaultGameDir },
  //     gameClientId: gameToDownloadOnStart,
  //   },
  //   installStatus: "Downloading",
  // });
  // nodeLogger.log("Download started", remoteGameInfo.downloadUrl);
  // mainWindow.webContents.downloadURL(remoteGameInfo.downloadUrl, {
  //   headers: {
  //     guestId: launcherStore.getGuestId(),
  //   },
  // });
};
