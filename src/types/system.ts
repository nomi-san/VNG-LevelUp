import type { DownloadItem } from "electron";

import type { DetailsPageGameInfo, GameClientId } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

///////////////////////////////
export interface DownloadInitInfo {
  gameClientId: GameClientId;
  remoteGameInfo: DetailsPageGameInfo;
  properties: {
    directory: string;
  };
  shouldCreateShortcut: boolean;
  downloadInitTime: number;
  gameUpdateInfo: GameUpdateInfo;
}

type TypeOfClassMethod<T, M extends keyof T> = T[M] extends (...args: unknown[]) => unknown
  ? T[M]
  : never;

type DownloadStatusFromLib = ReturnType<TypeOfClassMethod<DownloadItem, "getState">>;
export type InstallStatus =
  | "Downloading"
  | "Downloaded"
  | "Unziping"
  | "Unzip Success"
  | "Unzip Failed"
  | "Valid File"
  | "Invalid File"
  | "Removing Files"
  | "Removing Files Failed"
  | "Adding Files"
  | "Adding Files Failed"
  | "Game Info Set"
  | "Deeplink Registered";

export type DownloadStatus = DownloadStatusFromLib | "initializing";

export type InterruptReason =
  | "notEnoughSpaceForInstallation"
  | "notEnoughSpaceForDownload"
  | "pause"
  | "unknown"
  | ""
  | "serverError"
  | `serverError - ${string}`;

export type UnzipInterruptReason = "notEnoughSpaceForUnzip" | "";
export type UnzipProgress = {
  unzippedBytes: number;
  totalBytes: number;
  percent: number;
  interruptReason?: UnzipInterruptReason;
};

type DownloadProgress = {
  transferredBytes: number;
  totalBytes: number;
  percent: number;
  bytesPerSecond: number;
  status: DownloadStatus;
  isPaused: boolean;
  remainingMinutes: number;
  remainingSeconds: number;
  remainingTime: number;
  interruptReason: InterruptReason;
} & Partial<AvailableStorage>;

export interface SerializableDownloadProgressItem {
  download: DownloadProgress;
  install: {
    status: InstallStatus;
    progress: UnzipProgress;
  };
  downloadUrl: string;
  internalVersion: number;
  isFullPackage: boolean;
}

export interface DownloadProgressInfo {
  initInfo: DownloadInitInfo;
  progress: SerializableDownloadProgressItem[];
  currentDownloadIndex: number;
}

export interface DownloadItemInteractionParams {
  gameClientId: GameClientId;
  internalVersion: number;
}

///////////////////////////////

export interface DeepLinkRegisterParams {
  deeplink: string;
  gamePath: string;
}

///////////////////////////////

export interface AvailableStorage {
  totalFreeSpace: number;
  diskSpaceAvailableForUser: number;
}

export interface DirectoryInfo {
  selectedDir: string;
  availableStorage: AvailableStorage;
}

export interface SelectDirectoryAndAppendFolder {
  // In most cases this is GameName but
  // it can also be GamePublisher/GameName so you have to use path.join
  directory?: string;
}

///////////////////////////////

export interface FocusWebView {
  action: "focusAppMenu" | "unfocusAppMenu";
}

///////////////////////////////

export interface UserSessionInfo {
  session: string;
  guestId: string;
  isValidatingSession: boolean;
}
