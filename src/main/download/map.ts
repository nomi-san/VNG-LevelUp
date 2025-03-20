import { type DownloadItem, type WebContentsView } from "electron";

import { FROM_NODE_UPDATE_DOWNLOAD_LIST } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { removeFolder } from "@src/main/utils-dir";
import { makePatchFolder } from "@src/main/utils/game-install";
import type { GameClientId } from "@src/types/game";
import type {
  DownloadProgressInfo,
  InterruptReason,
  SerializableDownloadProgressItem,
} from "@src/types/system";

// We don't want to expose the cancel method because cancel always goes with clean up
export type EncapsulatedDownloadItem = Omit<DownloadItem, "cancel">;

export interface DownloadProgressItem extends SerializableDownloadProgressItem {
  item: EncapsulatedDownloadItem | null;
}

export interface GameDownloadEntry {
  initInfo: DownloadProgressInfo["initInfo"];
  currentDownloadIndex: DownloadProgressInfo["currentDownloadIndex"];
  progress: DownloadProgressItem[];
  downloadInterruptReason?: InterruptReason;
}

const gameDownloadsMap = new Map<GameClientId, GameDownloadEntry>();

export const getGameDownloadEntry = (clientId: GameClientId): GameDownloadEntry | undefined => {
  return gameDownloadsMap.get(clientId);
};
export const getAllGameDownloadEntry = (): GameDownloadEntry[] => {
  return Array.from(gameDownloadsMap.values());
};
export const setGameDownloadEntry = (
  clientId: GameClientId,
  downloadItem: GameDownloadEntry,
): void => {
  gameDownloadsMap.set(clientId, downloadItem);
};

export const cancelAllDownloadItemEntries = async (clientId: GameClientId): Promise<void> => {
  const downloadItem = gameDownloadsMap.get(clientId);

  nodeLogger.log("Cancelling download item entry for ", downloadItem?.initInfo.gameClientId);

  if (!downloadItem) return;

  for (const { item, internalVersion, download, install, isFullPackage } of downloadItem.progress) {
    if (install.status === "Deeplink Registered") {
      nodeLogger.log(
        "Tried to cancel game ",
        clientId,
        " but it's already installed version ",
        internalVersion,
      );
      continue;
    }

    download.status = "cancelled";

    nodeLogger.log(
      "Cancelling download item for ",
      internalVersion,
      item?.getURL(),
      " with state ",
      item?.getState(),
    );
    if (item) {
      item.pause();
      (item as DownloadItem).cancel();
    }

    if (isFullPackage) {
      nodeLogger.log(
        "Item is full package, removing folder",
        downloadItem.initInfo.properties.directory,
      );
      await removeFolder(downloadItem.initInfo.properties.directory);
    } else {
      nodeLogger.log(
        "Item is not full package, removing folder",
        makePatchFolder(downloadItem.initInfo),
      );
      await removeFolder(makePatchFolder(downloadItem.initInfo));
    }
  }
};

export const makeDownloadProgressInfosFromEntry = ({
  initInfo,
  progress,
  currentDownloadIndex,
}: GameDownloadEntry): DownloadProgressInfo => {
  return {
    progress: progress.map(
      ({ download, install, internalVersion, downloadUrl, isFullPackage }) => ({
        download,
        install,
        internalVersion,
        downloadUrl,
        isFullPackage,
      }),
    ),
    initInfo,
    currentDownloadIndex,
  };
};

export const makeDownloadProgressInfos = (): DownloadProgressInfo[] => {
  const results: DownloadProgressInfo[] = [];
  gameDownloadsMap.forEach((entry) => {
    results.push(makeDownloadProgressInfosFromEntry(entry));
  });

  return results;
};

export const removeDownloadItemAndNotifyRenderer = (
  appContentView: WebContentsView,
  clientId: GameClientId,
): void => {
  nodeLogger.log("Removing download item and notifying renderer", { clientId });
  gameDownloadsMap.delete(clientId);
  appContentView.webContents.send(FROM_NODE_UPDATE_DOWNLOAD_LIST, makeDownloadProgressInfos());
};
