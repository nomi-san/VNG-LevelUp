import { readFile } from "fs/promises";
import path from "path";
import { app, type WebContentsView } from "electron";

import nodeLogger from "@src/logger/serverLogger";
import { createEmptyUnzipProgress } from "@src/main/download/const";
import {
  getGameDownloadEntry,
  type EncapsulatedDownloadItem,
  type GameDownloadEntry,
} from "@src/main/download/map";
import {
  calculateRemainingTime,
  getItemInfo,
  mutateDownload,
  mutateInstall,
  updateProgressOnRenderer,
} from "@src/main/download/utils";
import { extractZipAndReportProgress } from "@src/main/download/zip";
import { createShortcut } from "@src/main/shortcut";
import launcherStore from "@src/main/store";
import {
  checkIfFileExists,
  moveFile,
  removeFile,
  removeFolder,
  validateFileHash,
} from "@src/main/utils-dir";
import { makeDeepLinkName } from "@src/main/utils/deeplink";
import {
  makePatchContentFolder,
  makePatchFolder,
  makePatchMetadataFile,
  type DiffObjectV2,
} from "@src/main/utils/game-install";
import type { GameClientId, LocalGameInternalVersion } from "@src/types/game";
import type { UnzipProgress } from "@src/types/system";

export async function installTheZipFileRecursively({
  clientId,
  internalVersion,
  appContentView,
}: {
  clientId: GameClientId;
  internalVersion: LocalGameInternalVersion;
  appContentView: WebContentsView;
}): Promise<{ gamePath: string } | null> {
  nodeLogger.debug("start recursively installing version ", internalVersion);
  const result = getCurrentDownloadItemSafely({
    clientId,
    internalVersion,
  });
  if (!result) return null;
  const { currentDownload, downloadItemIndex, item } = result;

  currentDownload.currentDownloadIndex = downloadItemIndex;
  mutateDownload(currentDownload.progress[downloadItemIndex].download, {
    ...getItemInfo(item),
    totalFreeSpace: undefined,
    diskSpaceAvailableForUser: undefined,
    ...calculateRemainingTime(item),
    interruptReason: "",
  });
  mutateInstall(currentDownload.progress[downloadItemIndex].install, {
    status: "Unziping",
    progress: createEmptyUnzipProgress(
      currentDownload.initInfo.gameUpdateInfo.resources[downloadItemIndex],
    ),
  });

  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);

  nodeLogger.debug("start unzipping");
  const zipResult = await extractZipAndReportProgress({
    currentDownload,
    downloadItemIndex,
    appContentView,
    itemSavePath: item.getSavePath(),
    updateInstallStatus: (installStatus, zipResult) => {
      currentDownload.currentDownloadIndex = downloadItemIndex;
      mutateInstall(currentDownload.progress[downloadItemIndex].install, {
        status: installStatus,
        progress: zipResult,
      });
    },
  });
  if (!zipResult) return null;

  if (!currentDownload.progress[downloadItemIndex].isFullPackage) {
    await handlePatchInstallation({
      currentDownload,
      downloadItemIndex,
      appContentView,
      zipResult,
    });
  }

  const gamePath = path.join(
    currentDownload.initInfo.properties.directory,
    currentDownload.initInfo.remoteGameInfo.runnablePath,
  );

  setupGameInfo({ gamePath, currentDownload, downloadItemIndex, appContentView, zipResult });

  if (currentDownload.initInfo.shouldCreateShortcut) {
    const gameInfo = launcherStore.getGameInfo(currentDownload.initInfo.remoteGameInfo.id);
    nodeLogger.log("creating shortcut with gameInfo", gameInfo?.runnablePath);
    if (gameInfo) {
      createShortcut({
        title: currentDownload.initInfo.remoteGameInfo.title,
        gameId: currentDownload.initInfo.remoteGameInfo.id,
        iconPath: gameInfo.runnablePath,
      });
    }
  }

  if (currentDownload.progress[downloadItemIndex].isFullPackage) {
    nodeLogger.log("Removing file: ", item.getSavePath());
    await removeFile(item.getSavePath());
  }

  const isLastDownload = downloadItemIndex === currentDownload.progress.length - 1;
  if (isLastDownload) {
    nodeLogger.log("Reached last download, removing patch folder");
    if (!currentDownload.progress[downloadItemIndex].isFullPackage) {
      const contentFolder = makePatchFolder(currentDownload.initInfo);
      await removeFolder(contentFolder);
    }
  } else {
    const nextDownloadItem = currentDownload.progress.at(downloadItemIndex + 1);
    nodeLogger.log(
      "Install patch finished, next download item: ",
      nextDownloadItem?.internalVersion,
      nextDownloadItem?.install.status,
    );
    if (nextDownloadItem?.install.status === "Downloaded") {
      await installTheZipFileRecursively({
        clientId: currentDownload.initInfo.remoteGameInfo.id,
        internalVersion: nextDownloadItem.internalVersion,
        appContentView,
      });
    }
  }

  return { gamePath };
}

const getCurrentDownloadItemSafely = ({
  clientId,
  internalVersion: _internalVersion,
}: {
  clientId: GameClientId;
  internalVersion: LocalGameInternalVersion;
}): {
  currentDownload: GameDownloadEntry;
  downloadItemIndex: number;
  item: EncapsulatedDownloadItem;
} | null => {
  const currentDownloadItem = getGameDownloadEntry(clientId);
  if (!currentDownloadItem) return null;

  const currentDownload = getGameDownloadEntry(clientId);
  if (!currentDownload) return null;
  const downloadItemIndex = currentDownload.progress.findIndex(
    ({ internalVersion }) => internalVersion === _internalVersion,
  );
  if (downloadItemIndex === -1) return null;

  const item = currentDownload.progress[downloadItemIndex].item;
  if (!item) return null;

  return { currentDownload, downloadItemIndex, item };
};

const handlePatchInstallation = async ({
  currentDownload,
  downloadItemIndex,
  appContentView,
  zipResult,
}: {
  currentDownload: GameDownloadEntry;
  downloadItemIndex: number;
  appContentView: WebContentsView;
  zipResult: UnzipProgress;
}): Promise<void> => {
  const contentFolder = makePatchContentFolder(currentDownload.initInfo);
  const patchMetadataFile = makePatchMetadataFile(currentDownload.initInfo);
  nodeLogger.log(
    "Start removing/add files for: ",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );
  const diffObject: DiffObjectV2 = JSON.parse(await readFile(patchMetadataFile, "utf8"));

  await removeOldGameFiles({
    currentDownload,
    downloadItemIndex,
    appContentView,
    zipResult,
    diffObject,
  });

  await addNewGameFiles({
    currentDownload,
    downloadItemIndex,
    zipResult,
    diffObject,
    appContentView,
    contentFolder,
  });

  nodeLogger.log(
    "Applying patch successfully, internalVersion: ",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );
};

const removeOldGameFiles = async ({
  currentDownload,
  downloadItemIndex,
  appContentView,
  zipResult,
  diffObject,
}: {
  currentDownload: GameDownloadEntry;
  downloadItemIndex: number;
  appContentView: WebContentsView;
  zipResult: UnzipProgress;
  diffObject: DiffObjectV2;
}): Promise<void> => {
  nodeLogger.log(
    "Removing files for: ",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );
  mutateInstall(currentDownload.progress[downloadItemIndex].install, {
    status: "Removing Files",
    progress: zipResult,
  });
  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
  nodeLogger.log(diffObject);
  for (const key of Object.keys(diffObject.removed)) {
    const filePath = path.join(currentDownload.initInfo.properties.directory, key);
    const [result, error] = await checkIfFileExists(filePath);
    if (!result || error) {
      nodeLogger.log("File not found", filePath);
    }
    nodeLogger.log("Removing file: ", filePath);
    await removeFile(filePath);
  }
  nodeLogger.log(
    "Removing files successfully for: ",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );
};

const addNewGameFiles = async ({
  currentDownload,
  downloadItemIndex,
  zipResult,
  diffObject,
  appContentView,
  contentFolder,
}: {
  downloadItemIndex: number;
  currentDownload: GameDownloadEntry;
  zipResult: UnzipProgress;
  diffObject: DiffObjectV2;
  appContentView: WebContentsView;
  contentFolder: string;
}): Promise<void> => {
  nodeLogger.log("Adding files for: ", currentDownload.progress[downloadItemIndex].internalVersion);
  mutateInstall(currentDownload.progress[downloadItemIndex].install, {
    status: "Adding Files",
    progress: zipResult,
  });
  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
  for (const key of Object.keys(diffObject.added)) {
    const filePath = path.join(contentFolder, key);
    const [result, error] = await checkIfFileExists(filePath);
    if (!result || error) {
      nodeLogger.log("File not found", filePath);
    }
    const destinationPath = path.join(currentDownload.initInfo.properties.directory, key);
    nodeLogger.log("Moving file: ", filePath, " to: ", destinationPath);
    await moveFile(filePath, destinationPath);

    const validateFileHashResult = validateFileHash(destinationPath, diffObject.added[key]);
    if (!validateFileHashResult) {
      nodeLogger.error("File hash not match for file: ", destinationPath);
    } else {
      nodeLogger.log("File hash matched for file: ", destinationPath);
    }
  }
  nodeLogger.log(
    "Adding files successfully for: ",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );
};

const setupGameInfo = ({
  currentDownload,
  downloadItemIndex,
  appContentView,
  zipResult,
  gamePath,
}: {
  currentDownload: GameDownloadEntry;
  downloadItemIndex: number;
  appContentView: WebContentsView;
  zipResult: UnzipProgress;
  gamePath: string;
}): void => {
  nodeLogger.log(
    "Setting game info for: ",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );
  const existingGame = launcherStore.getGameInfo(currentDownload.initInfo.remoteGameInfo.id);
  launcherStore.setGameInfo(currentDownload.initInfo.remoteGameInfo.id, {
    runnablePath: gamePath,
    rootFolderPath: existingGame
      ? existingGame.rootFolderPath
      : currentDownload.initInfo.properties.directory,
    internalVersion: currentDownload.progress[downloadItemIndex].internalVersion,
  });

  currentDownload.currentDownloadIndex = downloadItemIndex;
  mutateInstall(currentDownload.progress[downloadItemIndex].install, {
    status: "Game Info Set",
    progress: zipResult,
  });
  nodeLogger.log(
    "mutateInstall",
    downloadItemIndex,
    currentDownload.progress[downloadItemIndex].install,
  );
  nodeLogger.log("Game Info Set for:", currentDownload.progress[downloadItemIndex].internalVersion);
  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);

  app.setAsDefaultProtocolClient(
    makeDeepLinkName(currentDownload.initInfo.remoteGameInfo.id),
    gamePath,
  );
  currentDownload.currentDownloadIndex = downloadItemIndex;
  mutateInstall(currentDownload.progress[downloadItemIndex].install, {
    status: "Deeplink Registered",
    progress: zipResult,
  });
  nodeLogger.log(
    "mutateInstall",
    downloadItemIndex,
    currentDownload.progress[downloadItemIndex].install,
  );
  nodeLogger.log(
    "Deeplink Registered for:",
    currentDownload.progress[downloadItemIndex].internalVersion,
  );

  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
};
