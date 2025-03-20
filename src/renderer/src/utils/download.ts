import { type GameUpdateInfo } from "@src/types/game-update";
import type { DownloadProgressInfo, DownloadStatus, InstallStatus } from "@src/types/system";

const formatGB = (sizeInGB: number): number => {
  return Math.floor(sizeInGB * 10) / 10;
};
const formatKBorMB = (size: number): number => {
  return Math.floor(size);
};

export const triggerUnzip = async (path: string): Promise<void> => {
  window.api.app_extractZip(path);
};

export const convertBytesToMB = (bytes: number): number => {
  return formatKBorMB(bytes / 1024 / 1024);
};

const convertBytesToGB = (bytes: number): number => {
  return formatGB(bytes / 1024 / 1024 / 1024);
};

export const convertBytesToMBorGB = (bytes: number): string => {
  if (bytes > 1024 * 1024 * 1024) return convertBytesToGB(bytes).toFixed(1) + "GB";
  return convertBytesToMB(bytes) + "MB";
};

export const convertBytesToKB = (bytes: number): string => {
  return formatKBorMB(bytes / 1024) + "KB";
};

const isItemDownloading = ({
  downloadStatus,
  installStatus,
}: {
  downloadStatus: DownloadStatus;
  installStatus: InstallStatus;
}): boolean => {
  return downloadStatus === "progressing" || installStatus === "Downloading";
};

export const isDownloading = (downloadProgressInfo: DownloadProgressInfo): boolean => {
  return downloadProgressInfo.progress.some(({ download, install }) =>
    isItemDownloading({
      downloadStatus: download.status,
      installStatus: install.status,
    }),
  );
};

export const isInstalling = (downloadProgressInfo: DownloadProgressInfo): boolean => {
  return downloadProgressInfo.progress.some(({ install }) => install.status === "Unziping");
};

export const isDownloadContainingErrors = (downloadProgressInfo: DownloadProgressInfo): boolean => {
  const isDownloadError = downloadProgressInfo.progress.some(
    ({ download }) => download.status === "interrupted",
  );
  const isInstallError = downloadProgressInfo.progress.some(
    ({ install }) => install.status === "Unzip Failed" || install.status === "Invalid File",
  );

  return isDownloadError || isInstallError;
};

export const isDownloadCancelled = (downloadProgressInfo: DownloadProgressInfo): boolean => {
  return downloadProgressInfo.progress.some(({ download }) => download.status === "cancelled");
};

export const isInstallSuccess = (downloadProgressInfo: DownloadProgressInfo): boolean => {
  return downloadProgressInfo.progress.every(({ install }) => {
    return install.status === "Deeplink Registered";
  });
};

export const isInstallContainingErrors = (downloadProgressInfo: DownloadProgressInfo): boolean => {
  return downloadProgressInfo.progress.some(
    ({ install }) => install.status === "Unzip Failed" || install.status === "Invalid File",
  );
};

export const findIndexOfErrorInstall = (
  downloadProgressInfo: DownloadProgressInfo,
): number | undefined => {
  return downloadProgressInfo.progress.findIndex(
    ({ install }) => install.status === "Unzip Failed" || install.status === "Invalid File",
  );
};

type SizeType = {
  sizeInMB: number;
  sizeInText: string;
};

const convertFromMB = (sizeInMB: number): SizeType => {
  if (sizeInMB > 1024) {
    return {
      sizeInMB,
      sizeInText: formatGB(sizeInMB / 1024).toFixed(1) + "GB",
    };
  }

  return { sizeInMB, sizeInText: sizeInMB + "MB" };
};

export const calculateTotalDownloadSize = (gameUpdateInfo: GameUpdateInfo): SizeType => {
  const sizeInMB = gameUpdateInfo.resources.reduce((acc, curr) => acc + curr.patchSize, 0);
  return convertFromMB(sizeInMB);
};

export const getStableDownloadSpeed = (bytesPerSecond: number): number => {
  if (bytesPerSecond) return bytesPerSecond;
  const STABLE_DOWNLOAD_SPEED = 5 * 1024 * 1024; // 5MB/s
  return STABLE_DOWNLOAD_SPEED;
};
