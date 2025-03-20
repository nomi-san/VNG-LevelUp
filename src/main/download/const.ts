import type { GameUpdateResource } from "@src/types/game-update";
import type { DownloadProgressInfo, UnzipProgress } from "@src/types/system";

const knownErrorCodes = new Set(["net::ERR_ABORTED"]);
export const isKnownError = (error: string): boolean => {
  return knownErrorCodes.has(error);
};

const emptyUnzipProgress: UnzipProgress = {
  percent: 0,
  totalBytes: 0,
  unzippedBytes: 0,
};

const emptyInstallProgress = {
  status: "Downloading",
  progress: emptyUnzipProgress,
} as const;

const emptyDownloadProgress: DownloadProgressInfo["progress"][number]["download"] = {
  totalBytes: 0,
  transferredBytes: 0,
  percent: 0,
  bytesPerSecond: 0,
  status: "initializing",
  isPaused: false,
  remainingMinutes: 0,
  remainingSeconds: 0,
  remainingTime: 0,
  interruptReason: "",
};

export const createEmptyDownloadProgress = (
  resource: GameUpdateResource,
): DownloadProgressInfo["progress"][number]["download"] => {
  return {
    ...emptyDownloadProgress,
    totalBytes: resource.patchSize * 1024 * 1024,
  };
};

export const createEmptyInstallProgress = (
  resource: GameUpdateResource,
): DownloadProgressInfo["progress"][number]["install"] => {
  return {
    ...emptyInstallProgress,
    progress: {
      ...emptyUnzipProgress,
      totalBytes: resource.patchSize * 1024 * 1024,
    },
  };
};

export const createEmptyUnzipProgress = (
  resource: GameUpdateResource,
): DownloadProgressInfo["progress"][number]["install"]["progress"] => {
  return {
    ...emptyUnzipProgress,
    totalBytes: resource.patchSize * 1024 * 1024,
  };
};
