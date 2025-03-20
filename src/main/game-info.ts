import { join } from "node:path";
import { ipcMain, type WebContentsView } from "electron";

import {
  FROM_RENDERER_CHECK_FOR_AVAILABLE_STORAGE,
  FROM_RENDERER_GET_DEFAULT_GAME_DIR,
  FROM_RENDERER_SET_DEFAULT_GAME_DIR,
  FROM_RENDERER_STORE_CLEAR_GAME_INFO,
  FROM_RENDERER_STORE_GET_ALL_GAME_IDS,
  FROM_RENDERER_STORE_GET_GAME_INFO,
  FROM_RENDERER_UNINSTALL_GAME,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { removeDownloadItemAndNotifyRenderer } from "@src/main/download/map";
import type { CommonEventParams } from "@src/types/common";
import type { GameClientId, LocalGameInfoV3 } from "@src/types/game";
import type { UninstallGameParams } from "@src/types/native-game";
import type { DirectoryInfo, SelectDirectoryAndAppendFolder } from "@src/types/system";

import { makeShortcutPath } from "./shortcut";
import launcherStore from "./store";
import { checkForAvailableStorage } from "./utils";
import { checkIfFileExists, removeFile, removeFolder } from "./utils-dir";

const getValidatedGameInfo = async (gameId: GameClientId): Promise<LocalGameInfoV3 | null> => {
  const gameInfo = launcherStore.getGameInfo(gameId);
  nodeLogger.debug("getValidatedGameInfo", { gameId, gameInfo });

  if (!gameInfo) return null;
  const [fileExists] = await checkIfFileExists(gameInfo.runnablePath);

  if (!fileExists) {
    nodeLogger.log("file does not exist", gameInfo.runnablePath);

    launcherStore.clearGameInfo(gameId);
    return null;
  }
  return gameInfo;
};

export const handleGameInfo = (appContentView: WebContentsView) => {
  ipcMain.handle(
    FROM_RENDERER_GET_DEFAULT_GAME_DIR,
    async (
      _,
      { directory }: SelectDirectoryAndAppendFolder,
    ): Promise<DirectoryInfo | undefined> => {
      const selectedDir = launcherStore.getDefaultGameDir();
      if (!selectedDir) return undefined;

      const availableStorage = await checkForAvailableStorage(selectedDir);

      const result: DirectoryInfo = {
        availableStorage,
        selectedDir: directory ? join(selectedDir, directory) : selectedDir,
      };
      return result;
    },
  );
  ipcMain.handle(FROM_RENDERER_CHECK_FOR_AVAILABLE_STORAGE, async (_, dir: string) => {
    const result: DirectoryInfo = {
      availableStorage: await checkForAvailableStorage(dir),
      selectedDir: dir,
    };

    return result;
  });
  ipcMain.handle(FROM_RENDERER_SET_DEFAULT_GAME_DIR, (_, dir: string) => {
    launcherStore.setDefaultGameDir(dir);
  });

  ipcMain.handle(FROM_RENDERER_STORE_GET_GAME_INFO, async (_, { clientId }: CommonEventParams) => {
    const validatedGameInfo = await getValidatedGameInfo(clientId);
    return validatedGameInfo;
  });

  ipcMain.handle(FROM_RENDERER_STORE_CLEAR_GAME_INFO, (_, { clientId }: CommonEventParams) => {
    nodeLogger.debug("clearGameInfo", clientId);
    launcherStore.clearGameInfo(clientId);
  });

  ipcMain.handle(
    FROM_RENDERER_UNINSTALL_GAME,
    async (_, { title, gameClientId }: UninstallGameParams) => {
      removeDownloadItemAndNotifyRenderer(appContentView, gameClientId);

      const gameInfo = launcherStore.getGameInfo(gameClientId);
      if (!gameInfo) {
        nodeLogger.warn("Tried to removed game but no game info found");
        return true;
      }

      await removeFolder(gameInfo.rootFolderPath);

      const shortcutPath = makeShortcutPath(title);
      await removeFile(shortcutPath);

      launcherStore.clearGameInfo(gameClientId);

      return true;
    },
  );

  ipcMain.handle(FROM_RENDERER_STORE_GET_ALL_GAME_IDS, async () => {
    const gameIds = launcherStore.getAllGameIds();
    if (!gameIds) return null;

    const validatedGameIds = await Promise.all(
      gameIds.map(async (gameId) => {
        const validatedGameInfo = await getValidatedGameInfo(gameId);
        if (!validatedGameInfo) return null;
        return gameId;
      }),
    ).then((updatedGameIds) => updatedGameIds.filter(Boolean));

    return validatedGameIds;
  });
};
