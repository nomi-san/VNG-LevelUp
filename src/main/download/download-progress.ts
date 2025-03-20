import path from "path";
import { type WebContentsView } from "electron";

import { FROM_NODE_UPDATE_DOWNLOAD_LIST } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { createEmptyUnzipProgress, isKnownError } from "@src/main/download/const";
import { installTheZipFileRecursively } from "@src/main/download/install";
import {
  cancelAllDownloadItemEntries,
  getAllGameDownloadEntry,
  getGameDownloadEntry,
  makeDownloadProgressInfos,
  type EncapsulatedDownloadItem,
  type GameDownloadEntry,
} from "@src/main/download/map";
import {
  calculateRemainingTime,
  downloadUrlWithHeader,
  getItemInfo,
  mutateDownload,
  mutateInstall,
  updateProgressOnRenderer,
} from "@src/main/download/utils";
import { checkForAvailableStorage, FREE_SPACE_THRESHOLD } from "@src/main/utils";
import { checkIfFileExists, removeFile } from "@src/main/utils-dir";
import { makePatchFolder } from "@src/main/utils/game-install";
import type { DownloadProgressInfo, DownloadStatus, InterruptReason } from "@src/types/system";

export const cancelAllDownloadsInProgressAndCleanUpFolders = (): void => {
  const downloadItems = getAllGameDownloadEntry();
  downloadItems.forEach(({ initInfo }) => {
    void cancelAllDownloadItemEntries(initInfo.gameClientId);
  });
};

export const cleanUpPreviousDownloads = async (initInfo: DownloadProgressInfo["initInfo"]) => {
  for (const resource of initInfo.gameUpdateInfo.resources) {
    if (resource.isFullPackage) {
      const downloadUrl = resource.patch.url;
      if (!downloadUrl) {
        //TODO: warn user
        console.log("No download url");

        return;
      }

      const savePath = path.join(
        initInfo.properties.directory,
        downloadUrl.split("/").pop() as string,
      );
      const [fileExists] = await checkIfFileExists(savePath);
      if (fileExists) await removeFile(savePath);
    }
  }
  await removeFile(makePatchFolder(initInfo));
};

const isGameInstallFinished = (downloadMapItem: GameDownloadEntry["progress"][number]) =>
  downloadMapItem.install.status === "Valid File" ||
  downloadMapItem.install.status === "Game Info Set" ||
  downloadMapItem.install.status === "Deeplink Registered";

export const handleGameDownloadProgress = (appContentView: WebContentsView): void => {
  appContentView.webContents.session.on("will-download", async (event, item) => {
    const result = findDownloadEntryAndItemIndex(item.getURL());
    if (!result) {
      event.preventDefault();
      return;
    }

    const { currentDownload, downloadItemIndex } = result;

    const isFirstDownload = downloadItemIndex === 0;
    const isLastDownload = downloadItemIndex === currentDownload.progress.length - 1;

    appContentView.webContents.send(FROM_NODE_UPDATE_DOWNLOAD_LIST, makeDownloadProgressInfos());

    const zipFileName = item.getURL().split("/").pop() as string;
    const savePath = currentDownload.progress[downloadItemIndex].isFullPackage
      ? path.join(currentDownload.initInfo.properties.directory, zipFileName)
      : path.join(makePatchFolder(currentDownload.initInfo), zipFileName);

    item.setSavePath(savePath);
    currentDownload.progress[downloadItemIndex].item = item;

    item.on("updated", async (_, state) => {
      const previousInterruptReason =
        currentDownload.progress[downloadItemIndex].download.interruptReason;
      currentDownload.currentDownloadIndex = downloadItemIndex;

      mutateDownload(currentDownload.progress[downloadItemIndex].download, {
        ...getItemInfo(item),
        totalFreeSpace: undefined,
        diskSpaceAvailableForUser: undefined,
        ...calculateRemainingTime(item),
        interruptReason: state === "interrupted" ? previousInterruptReason : "",
      });

      if (state === "interrupted") {
        nodeLogger.log("Download is interrupted");
        currentDownload.progress[downloadItemIndex].download.status = "interrupted";
        updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);

        const { totalFreeSpace, diskSpaceAvailableForUser } =
          await checkForAvailableStorage(savePath);

        currentDownload.progress[downloadItemIndex].download.status = "interrupted";
        currentDownload.progress[downloadItemIndex].download.diskSpaceAvailableForUser =
          diskSpaceAvailableForUser;
        currentDownload.progress[downloadItemIndex].download.totalFreeSpace = totalFreeSpace;

        let interruptReason: InterruptReason =
          currentDownload.progress[downloadItemIndex].download.interruptReason;
        if (item.isPaused()) {
          interruptReason = "pause";
        } else if (totalFreeSpace < FREE_SPACE_THRESHOLD) {
          interruptReason = "notEnoughSpaceForDownload";
        }
        nodeLogger.log("interrupt reason", interruptReason, totalFreeSpace, FREE_SPACE_THRESHOLD);
        currentDownload.progress[downloadItemIndex].download.interruptReason = interruptReason;
        updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
      } else if (state === "progressing") {
        if (item.isPaused()) {
          nodeLogger.log("Download is paused");
          currentDownload.progress[downloadItemIndex].download.status = "progressing";
          currentDownload.progress[downloadItemIndex].download.isPaused = true;
          updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
        } else {
          currentDownload.progress[downloadItemIndex].download.status = "progressing";
          updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
        }
      }
    });

    item.on("done", async (_, state) => {
      await handleItemDone({
        isFirstDownload,
        isLastDownload,
        currentDownload,
        downloadItemIndex,
        appContentView,
        state,
        item,
      });
    });
  });

  appContentView.webContents.session.webRequest.onErrorOccurred((details) => {
    if (!details.url.endsWith(".zip")) return;
    if (isKnownError(details.error)) return;

    getAllGameDownloadEntry().forEach((downloadItem) => {
      downloadItem.progress.forEach(({ download, downloadUrl }, index) => {
        if (downloadUrl !== details.url) return;

        if (!download) return;

        download.interruptReason = `serverError - ${details.error}`;

        updateProgressOnRenderer(appContentView, downloadItem, index);
      });
    });
    nodeLogger.log("Error intercepted:", details.url, details.error);
    nodeLogger.error(details.error, `Error when downloading ${details.url}: ${details.error}`);
  });
};

// When receiving "will-download", we only receive the url as the clue to find what item in the entry the event belongs to.
// So this funciton helps find it
// I tried adding query params in the link to simplify this, but it didn't work when we need to find both the entry and index
const findDownloadEntryAndItemIndex = (
  downloadItemUrl: string,
):
  | {
      currentDownload: GameDownloadEntry;
      downloadItemIndex: number;
    }
  | undefined => {
  const gameClientId = getAllGameDownloadEntry().find(({ progress }) =>
    progress.find(({ downloadUrl }) => {
      return downloadUrl === downloadItemUrl;
    }),
  )?.initInfo.gameClientId;
  if (!gameClientId) {
    nodeLogger.error("gameClientId is undefined");
    return undefined;
  }
  const currentDownload = getGameDownloadEntry(gameClientId);
  if (!currentDownload) {
    nodeLogger.error("currentDownload is undefined");
    // If users clicks on random download link, we will not have the download info
    // So we will not handle the download
    // We only manage game downloads
    // Even though this is a validation, it's good to error it so that we catch any unexpected case on Sentry
    return undefined;
  }

  let downloadItemIndex: number = -1;

  currentDownload.progress.forEach(({ downloadUrl }, index) => {
    if (downloadItemUrl.startsWith(downloadUrl)) {
      downloadItemIndex = index;
    }
  });
  if (downloadItemIndex === -1) {
    nodeLogger.error("downloadItemIndex is undefined");
    return;
  }
  return { currentDownload, downloadItemIndex };
};

export const handleItemDone = async ({
  currentDownload,
  downloadItemIndex,
  appContentView,
  state,
  item,
  isFirstDownload,
  isLastDownload,
}: {
  currentDownload: GameDownloadEntry;
  downloadItemIndex: number;
  appContentView: WebContentsView;
  state: DownloadStatus;
  item: EncapsulatedDownloadItem;
  isFirstDownload: boolean;
  isLastDownload: boolean;
}) => {
  // I am not sure why when a download item is completed, and we call item.cancel(), it will go to this and not cancelled state
  // So we need to check to make sure it doesn't go forward with this code path
  if (currentDownload.progress[downloadItemIndex].download.status === "cancelled") {
    nodeLogger.log(
      "Download is cancelled so it can't be completed",
      currentDownload.progress[downloadItemIndex].internalVersion,
    );
    return;
  }

  currentDownload.currentDownloadIndex = downloadItemIndex;
  mutateDownload(currentDownload.progress[downloadItemIndex].download, {
    ...getItemInfo(item),
    status: state,
    ...calculateRemainingTime(item),
    interruptReason: "",
  });
  mutateInstall(currentDownload.progress[downloadItemIndex].install, {
    status: "Downloaded",
    progress: createEmptyUnzipProgress(
      currentDownload.initInfo.gameUpdateInfo.resources[downloadItemIndex],
    ),
  });

  if (state === "completed") {
    updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
    nodeLogger.log(
      "Download successfully for ",
      currentDownload.progress[downloadItemIndex].internalVersion,
    );

    if (currentDownload)
      if (!item.getSavePath().endsWith(".zip")) {
        nodeLogger.error("The link doesn't point to a zip file");
        return;
      }

    if (!isLastDownload) {
      const nextDownloadItem = currentDownload.progress.at(downloadItemIndex + 1);
      if (!nextDownloadItem) return;
      downloadUrlWithHeader(appContentView, nextDownloadItem.downloadUrl);
    }

    const prevDownloadItem = isFirstDownload
      ? null
      : currentDownload.progress.at(downloadItemIndex - 1);
    if (!prevDownloadItem || isGameInstallFinished(prevDownloadItem)) {
      await installTheZipFileRecursively({
        clientId: currentDownload.initInfo.remoteGameInfo.id,
        internalVersion: currentDownload.progress[downloadItemIndex].internalVersion,
        appContentView,
      });
    }
  } else if (state === "cancelled") {
    nodeLogger.log(
      "Download is cancelled",
      currentDownload.progress[downloadItemIndex].internalVersion,
    );
    currentDownload.progress[downloadItemIndex].download.status = "cancelled";
    updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
  } else if (state == "interrupted") {
    nodeLogger.log(
      "Download is interrupted",
      currentDownload.progress[downloadItemIndex].internalVersion,
    );
    currentDownload.progress[downloadItemIndex].download.status = "interrupted";
    const interruptReason: InterruptReason = "serverError";
    currentDownload.progress[downloadItemIndex].download.interruptReason = interruptReason;
    updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
  }
};
