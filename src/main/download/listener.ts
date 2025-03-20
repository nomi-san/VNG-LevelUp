import { ipcMain, type WebContentsView } from "electron";

import {
  FROM_RENDERER_GAME_DOWNLOAD_CANCEL,
  FROM_RENDERER_GAME_DOWNLOAD_GET_ALL_DOWNLOADS,
  FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS,
  FROM_RENDERER_GAME_DOWNLOAD_PAUSE,
  FROM_RENDERER_GAME_DOWNLOAD_REMOVE_WHEN_INSTALL_SUCCESS,
  FROM_RENDERER_GAME_DOWNLOAD_RESUME,
  FROM_RENDERER_GAME_DOWNLOAD_RETRY,
  FROM_RENDERER_GAME_DOWNLOAD_START,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { createEmptyDownloadProgress, createEmptyInstallProgress } from "@src/main/download/const";
import {
  cleanUpPreviousDownloads,
  handleGameDownloadProgress,
} from "@src/main/download/download-progress";
import { installTheZipFileRecursively } from "@src/main/download/install";
import {
  cancelAllDownloadItemEntries,
  getGameDownloadEntry,
  makeDownloadProgressInfos,
  makeDownloadProgressInfosFromEntry,
  removeDownloadItemAndNotifyRenderer,
  setGameDownloadEntry,
  type GameDownloadEntry,
} from "@src/main/download/map";
import { downloadUrlWithHeader, updateProgressOnRenderer } from "@src/main/download/utils";
import type { CommonEventParams } from "@src/types/common";
import type { GameClientId } from "@src/types/game";
import type {
  DownloadInitInfo,
  DownloadItemInteractionParams,
  DownloadProgressInfo,
} from "@src/types/system";

export const handleGameDownloadListener = (appContentView: WebContentsView): void => {
  ipcMain.handle(FROM_RENDERER_GAME_DOWNLOAD_GET_ALL_DOWNLOADS, () => {
    return makeDownloadProgressInfos();
  });
  ipcMain.handle(
    FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS,
    (_, { clientId }: CommonEventParams) => {
      const currentDownloadEntry = getGameDownloadEntry(clientId);
      if (!currentDownloadEntry) return "NOT_FOUND";

      return makeDownloadProgressInfosFromEntry(currentDownloadEntry);
    },
  );

  ipcMain.on(FROM_RENDERER_GAME_DOWNLOAD_START, async (_, initInfo: DownloadInitInfo) => {
    const downloadEntry: GameDownloadEntry = {
      initInfo,
      progress: initInfo.gameUpdateInfo.resources.map((resource) => ({
        item: null,
        download: createEmptyDownloadProgress(resource),
        install: createEmptyInstallProgress(resource),
        internalVersion: resource.internalVersion,
        downloadUrl: resource.patch.url,
        isFullPackage: resource.isFullPackage,
      })),
      currentDownloadIndex: 0,
    };
    nodeLogger.log(
      "Game download started for: ",
      initInfo.remoteGameInfo.id,
      downloadEntry.progress.map(
        ({ downloadUrl, internalVersion }) => internalVersion + " " + downloadUrl,
      ),
    );

    setGameDownloadEntry(initInfo.gameClientId, downloadEntry);

    await cleanUpPreviousDownloads(initInfo);

    downloadUrlWithHeader(appContentView, initInfo.gameUpdateInfo.resources.at(0)!.patch.url);

    updateProgressOnRenderer(appContentView, getGameDownloadEntry(initInfo.gameClientId)!, 0);
  });

  ipcMain.on(
    FROM_RENDERER_GAME_DOWNLOAD_PAUSE,
    (_, { gameClientId, internalVersion }: DownloadItemInteractionParams) => {
      getGameDownloadEntry(gameClientId)
        ?.progress.find(
          ({ internalVersion: itemInternalVersion }) => itemInternalVersion === internalVersion,
        )
        ?.item?.pause();
    },
  );
  ipcMain.on(
    FROM_RENDERER_GAME_DOWNLOAD_RESUME,
    (_, { gameClientId, internalVersion }: DownloadItemInteractionParams) => {
      getGameDownloadEntry(gameClientId)
        ?.progress.find(
          ({ internalVersion: itemInternalVersion }) => itemInternalVersion === internalVersion,
        )
        ?.item?.resume();
    },
  );
  ipcMain.on(
    FROM_RENDERER_GAME_DOWNLOAD_CANCEL,
    async (_, { gameClientId }: DownloadItemInteractionParams) => {
      await cancelAllDownloadItemEntries(gameClientId);

      removeDownloadItemAndNotifyRenderer(appContentView, gameClientId);
    },
  );

  ipcMain.on(FROM_RENDERER_GAME_DOWNLOAD_REMOVE_WHEN_INSTALL_SUCCESS, (_, { clientId }) => {
    const shouldRemove = getGameDownloadEntry(clientId)?.progress.every(
      ({ install }) => install.status === "Deeplink Registered",
    );
    if (!shouldRemove) return;
    removeDownloadItemAndNotifyRenderer(appContentView, clientId);
  });

  ipcMain.on(
    FROM_RENDERER_GAME_DOWNLOAD_RETRY,
    async (_, { gameClientId }: DownloadItemInteractionParams) => {
      nodeLogger.log("game download retry ", gameClientId);
      const gameDownloadEntry = getGameDownloadEntry(gameClientId);

      if (!gameDownloadEntry) {
        nodeLogger.log("gameDownloadProgress is undefined");
        return;
      }

      const installItemWithErrorIndex = findTheFirstErrorInstallIndex(gameDownloadEntry);
      // No need to wait for this, prefer to retry download at the same time so that the error button becomes white
      void retryInstall({
        gameClientId,
        appContentView,
        gameDownloadEntry,
        installItemWithErrorIndex,
      });

      const downloadItemWithErrorIndex = findTheFirstErrorDownloadIndex(gameDownloadEntry);
      retryDownload({
        appContentView,
        gameDownloadEntry,
        downloadItemWithErrorIndex,
      });
    },
  );

  handleGameDownloadProgress(appContentView);
};

const retryDownload = ({
  appContentView,
  gameDownloadEntry,
  downloadItemWithErrorIndex,
}: {
  appContentView: WebContentsView;
  gameDownloadEntry: GameDownloadEntry;
  downloadItemWithErrorIndex: number;
}) => {
  if (downloadItemWithErrorIndex < 0) {
    nodeLogger.log("downloadItem is undefined for retry install");
    return;
  }
  const downloadItemProgress = gameDownloadEntry.progress.at(downloadItemWithErrorIndex);
  if (!downloadItemProgress) {
    nodeLogger.log("cant find downloadItemProgress");
    return;
  }
  if (!downloadItemProgress.item) {
    nodeLogger.log("Download retry", gameDownloadEntry.initInfo.remoteGameInfo.downloadUrl);
    downloadUrlWithHeader(appContentView, gameDownloadEntry.initInfo.remoteGameInfo.downloadUrl);
    return;
  } else {
    nodeLogger.log("downloadItemProgress", downloadItemProgress.download.status);
    if (downloadItemProgress.download.status === "interrupted") {
      if (downloadItemProgress.item.canResume()) {
        nodeLogger.log("resume download");
        downloadItemProgress.item.resume();
      } else {
        nodeLogger.log("cannot resume download, retry download from scratch");
        downloadUrlWithHeader(
          appContentView,
          gameDownloadEntry.initInfo.remoteGameInfo.downloadUrl,
        );
      }
    }
  }
};

const retryInstall = async ({
  gameClientId,
  appContentView,
  gameDownloadEntry,
  installItemWithErrorIndex,
}: {
  gameClientId: GameClientId;
  appContentView: WebContentsView;
  gameDownloadEntry: GameDownloadEntry;
  installItemWithErrorIndex: number;
}) => {
  if (installItemWithErrorIndex < 0) {
    nodeLogger.log("downloadItem is undefined for retry install");
    return;
  }
  const downloadItemProgress = gameDownloadEntry.progress.at(installItemWithErrorIndex);
  if (!downloadItemProgress) {
    nodeLogger.log("cant find downloadItemProgress");
    return;
  }

  if (downloadItemProgress) {
    await installTheZipFileRecursively({
      clientId: gameClientId,
      appContentView,
      internalVersion: downloadItemProgress.internalVersion,
    });
  }
};

export const findTheFirstErrorInstallIndex = (
  downloadProgressInfo: DownloadProgressInfo,
): number => {
  const errorDownloadIndex = downloadProgressInfo.progress.findIndex(({ install }) => {
    return install.status === "Unzip Failed" || install.status === "Invalid File";
  });

  return errorDownloadIndex;
};

export const findTheFirstErrorDownloadIndex = (
  downloadProgressInfo: DownloadProgressInfo,
): number => {
  const errorDownloadIndex = downloadProgressInfo.progress.findIndex(({ download }) => {
    return download.status === "interrupted";
  });

  return errorDownloadIndex;
};
