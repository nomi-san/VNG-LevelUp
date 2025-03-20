import { type WebContentsView } from "electron";

import { FROM_NODE_DOWNLOAD_UPDATE_STATUS } from "@src/const/events";
import type { EncapsulatedDownloadItem, GameDownloadEntry } from "@src/main/download/map";
import launcherStore from "@src/main/store";
import type { DownloadProgressInfo } from "@src/types/system";

export const calculateRemainingTime = (item: EncapsulatedDownloadItem) => {
  const remainingTime =
    (item.getTotalBytes() - item.getReceivedBytes()) / item.getCurrentBytesPerSecond();
  const timeToDownloadInSeconds = !item.getCurrentBytesPerSecond() ? 0 : Math.floor(remainingTime);
  const timeToDownloadInMinutes = !timeToDownloadInSeconds
    ? 0
    : Math.floor(timeToDownloadInSeconds / 60);
  return {
    remainingMinutes: timeToDownloadInMinutes,
    remainingSeconds: timeToDownloadInSeconds - timeToDownloadInMinutes * 60,
    remainingTime,
  };
};

export const updateProgressOnRenderer = (
  appContentView: WebContentsView,
  currentDownload: GameDownloadEntry,
  currentDownloadIndex: number,
) => {
  const downloadProgressEvent: DownloadProgressInfo = {
    progress: currentDownload.progress.map(
      ({ download, install, internalVersion, downloadUrl, isFullPackage }) => ({
        download,
        install,
        internalVersion,
        downloadUrl,
        isFullPackage,
      }),
    ),
    initInfo: currentDownload.initInfo,
    currentDownloadIndex,
  };
  appContentView.webContents.send(FROM_NODE_DOWNLOAD_UPDATE_STATUS, downloadProgressEvent);
};

export const getItemInfo = (item: EncapsulatedDownloadItem) => {
  return {
    totalBytes: item.getTotalBytes(),
    transferredBytes: item.getReceivedBytes(),
    percent: item.getPercentComplete(),
    bytesPerSecond: item.getCurrentBytesPerSecond(),
    isPaused: item.isPaused(),
    status: item.getState(),
  } as const;
};

export const mutateDownload = (
  download: DownloadProgressInfo["progress"][number]["download"],
  partialDownload: Partial<DownloadProgressInfo["progress"][number]["download"]>,
) => {
  download.totalBytes = partialDownload.totalBytes ?? download.totalBytes;
  download.transferredBytes = partialDownload.transferredBytes ?? download.transferredBytes;
  download.percent = partialDownload.percent ?? download.percent;
  download.bytesPerSecond = partialDownload.bytesPerSecond ?? download.bytesPerSecond;
  download.status = partialDownload.status ?? download.status;
  download.isPaused = partialDownload.isPaused ?? download.isPaused;
  download.remainingMinutes = partialDownload.remainingMinutes ?? download.remainingMinutes;
  download.remainingSeconds = partialDownload.remainingSeconds ?? download.remainingSeconds;
  download.remainingTime = partialDownload.remainingTime ?? download.remainingTime;
  download.interruptReason = partialDownload.interruptReason ?? download.interruptReason;
};

export const mutateInstall = (
  install: DownloadProgressInfo["progress"][number]["install"],
  partialInstall: Partial<DownloadProgressInfo["progress"][number]["install"]>,
) => {
  install.status = partialInstall.status ?? install.status;
  install.progress.totalBytes = partialInstall.progress?.totalBytes ?? install.progress.totalBytes;
  install.progress.unzippedBytes =
    partialInstall.progress?.unzippedBytes ?? install.progress.unzippedBytes;
  install.progress.percent = partialInstall.progress?.percent ?? install.progress.percent;
  install.progress.interruptReason =
    partialInstall.progress?.interruptReason ?? install.progress.interruptReason;
};

export const downloadUrlWithHeader = (appContentView: WebContentsView, downloadUrl: string) => {
  appContentView.webContents.downloadURL(downloadUrl, {
    headers: {
      guestId: launcherStore.getGuestId(),
    },
  });
};
