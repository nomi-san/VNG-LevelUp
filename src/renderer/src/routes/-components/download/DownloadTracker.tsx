import { useEffect, useRef } from "react";

import { useTracking } from "@renderer/analytics";
import { useDownloadProgressProvider } from "@renderer/providers/DownloadProvider";
import { isInstallSuccess } from "@renderer/utils/download";

import type { GameClientId } from "@src/types/game";
import type { DownloadProgressInfo } from "@src/types/system";

type DownloadTrackRecord = Record<10 | 20 | 30 | 50 | 80 | "downloadProgressSuccess", boolean>;

const DownloadTracker = ({
  clientId,
  internalVersions,
}: {
  clientId: GameClientId;
  internalVersions: number[];
}): null => {
  const { track } = useTracking();
  const { addSubscriber } = useDownloadProgressProvider();
  const trackedDownloads = useRef<Record<number, DownloadTrackRecord>>(
    internalVersions.reduce(
      (acc, internalVersion) => {
        acc[internalVersion] = {
          10: false,
          20: false,
          30: false,
          50: false,
          80: false,
          downloadProgressSuccess: false,
        };
        return acc;
      },
      {} as Record<number, DownloadTrackRecord>,
    ),
  );

  useEffect(() => {
    return addSubscriber(clientId, (info: DownloadProgressInfo) => {
      // There can be multiple downloads at the same time and this event contains all of them
      // Only one of them is actually being updated
      // We only want to track the download that main thread is trying to update to us

      const downloadingItem = info.progress[info.currentDownloadIndex];
      const internalVersion = downloadingItem.internalVersion;
      const currentTrackedDownloads = trackedDownloads.current[internalVersion];

      if (!downloadingItem) return;

      if (!downloadingItem.download.isPaused) {
        const trackProgress = (progressMilestone: number): void => {
          track({
            name: "download_progress_track",
            payload: {
              gameId: clientId,
              progress: progressMilestone,
              bytesPerSecond: downloadingItem.download.bytesPerSecond,
              download_init_time: info.initInfo.downloadInitTime,
              internal_version: internalVersion,
            },
          });
        };

        if (downloadingItem.download.percent >= 80 && !currentTrackedDownloads[80]) {
          currentTrackedDownloads[80] = true;
          trackProgress(80);
          return;
        }
        if (downloadingItem.download.percent >= 50 && !currentTrackedDownloads[50]) {
          currentTrackedDownloads[50] = true;
          trackProgress(50);
          return;
        }

        if (downloadingItem.download.percent >= 30 && !currentTrackedDownloads[30]) {
          currentTrackedDownloads[30] = true;
          trackProgress(30);
          return;
        }

        if (downloadingItem.download.percent >= 20 && !currentTrackedDownloads[20]) {
          currentTrackedDownloads[20] = true;
          trackProgress(20);
          return;
        }

        if (downloadingItem.download.percent >= 10 && !currentTrackedDownloads[10]) {
          currentTrackedDownloads[10] = true;
          trackProgress(10);
          return;
        }
      }

      if (downloadingItem.download.status === "interrupted") {
        track({
          name: "download_progress_interrupted",
          payload: {
            gameId: clientId,
            reason: downloadingItem.download.interruptReason,
            download_init_time: info.initInfo.downloadInitTime,
            internal_version: downloadingItem.internalVersion,
          },
        });
      }

      if (
        downloadingItem.download.status === "completed" &&
        !currentTrackedDownloads.downloadProgressSuccess
      ) {
        currentTrackedDownloads.downloadProgressSuccess = true;
        track({
          name: "download_progress_success",
          payload: {
            gameId: clientId,
            download_init_time: info.initInfo.downloadInitTime,
            internal_version: downloadingItem.internalVersion,
          },
        });

        const isLastDownload = info.currentDownloadIndex === info.progress.length - 1;
        if (isLastDownload) {
          track({
            name: "download_progress_completed_the_last_download",
            payload: {
              gameId: clientId,
              download_init_time: info.initInfo.downloadInitTime,
              internal_version: downloadingItem.internalVersion,
            },
          });
        }
      }
      if (isInstallSuccess(info)) {
        track({
          name: "install_progress_completed_the_last_install",
          payload: {
            gameId: clientId,
            download_init_time: info.initInfo.downloadInitTime,
            internal_versions: internalVersions,
          },
        });
      }
    });
  }, [clientId, track, addSubscriber, internalVersions]);
  return null;
};

export default DownloadTracker;
