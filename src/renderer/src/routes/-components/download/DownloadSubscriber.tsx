import { CirclePause, CirclePlay, CircleStop, RefreshCcw } from "lucide-react";

import { Button } from "@renderer/components/ui/button";
import { Label } from "@renderer/components/ui/label";
import { Progress } from "@renderer/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import useDownloadActions from "@renderer/hooks/useDownloadActions";
import useDownloadSubscriber from "@renderer/hooks/useDownloadSubscriber";
import useGameActions from "@renderer/hooks/useGameActions";
import { useTranslation } from "@renderer/i18n/useTranslation";
import {
  convertBytesToKB,
  convertBytesToMBorGB,
  findIndexOfErrorInstall,
  getStableDownloadSpeed,
  isDownloading,
  isInstallContainingErrors,
} from "@renderer/utils/download";

import type { DetailsPageGameInfo, GameClientId, ProductAuthType } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";
import type { DownloadProgressInfo, DownloadStatus, InstallStatus } from "@src/types/system";

const getProgressVariant = (downloadStatus: DownloadStatus | InstallStatus) => {
  switch (downloadStatus) {
    case "cancelled":
      return "gray";
    case "interrupted":
      return "red";
    case "completed":
    case "Valid File":
    case "Deeplink Registered":
      return "green";
    case "Unziping":
    case "progressing":
    default:
      return "gradient";
  }
};
const getLabelVariant = (
  downloadStatus: DownloadStatus | InstallStatus,
): "white" | "red" | "gray" | "green" => {
  switch (downloadStatus) {
    case "interrupted":
      return "red";
    case "completed":
    case "Deeplink Registered":
      return "green";
    case "progressing":
    case "Unziping":
    default:
      return "gray";
  }
};

type DowloadLabelResult = {
  label: string;
  variant: ReturnType<typeof getLabelVariant>;
  progressVariant: ReturnType<typeof getProgressVariant>;
  progressLabel: string;
  percent: number;
  status: DownloadStatus;
  installProgress: DownloadProgressInfo["progress"][number]["install"];
  isPaused: boolean;
  internalVersion: number;
};

const calculateRemainingTime = ({
  transferredBytes,
  totalBytes,
  speed,
}: {
  transferredBytes: number;
  totalBytes: number;
  speed: number;
}): { remainingMinutes: number; remainingSeconds: number } => {
  const remainingTime = (totalBytes - transferredBytes) / speed;
  const timeToDownloadInSeconds = !speed ? 0 : Math.floor(remainingTime);
  const timeToDownloadInMinutes = !timeToDownloadInSeconds
    ? 0
    : Math.floor(timeToDownloadInSeconds / 60);

  return {
    remainingMinutes: timeToDownloadInMinutes,
    remainingSeconds: timeToDownloadInSeconds - timeToDownloadInMinutes * 60,
  };
};

// TODO: Simplify this function
export const useDownloadLabels = (clientId: GameClientId): DowloadLabelResult => {
  const { isLoading, downloadProgressInfo } = useDownloadSubscriber(clientId, () => {});
  const { t } = useTranslation();
  const resultLabel: DowloadLabelResult = {
    label: "",
    variant: "gray",
    progressVariant: "gradient",
    progressLabel: "",
    percent: 0,
    status: "cancelled",
    installProgress: {
      status: "Downloading",
      progress: { percent: 0, unzippedBytes: 0, totalBytes: 0 },
    },
    isPaused: false,
    internalVersion: 0,
  };

  if (isLoading || downloadProgressInfo === "NOT_FOUND") {
    return resultLabel;
  }

  const sumTotalBytes = downloadProgressInfo.progress.reduce(
    (acc, { download }) => acc + download.totalBytes,
    0,
  );
  const sumTransferredBytes = downloadProgressInfo.progress.reduce(
    (acc, { download }) => acc + download.transferredBytes,
    0,
  );

  const installHasError = isInstallContainingErrors(downloadProgressInfo);
  // There's a case where current download is the 3rd download, but the install error is in the previous download
  const { download, install, internalVersion } = installHasError
    ? downloadProgressInfo.progress[
        findIndexOfErrorInstall(downloadProgressInfo) ?? downloadProgressInfo.currentDownloadIndex
      ]
    : downloadProgressInfo.progress[downloadProgressInfo.currentDownloadIndex];

  const { bytesPerSecond, status, isPaused, interruptReason } = download;

  const { remainingMinutes, remainingSeconds } = calculateRemainingTime({
    transferredBytes: sumTransferredBytes,
    totalBytes: sumTotalBytes,
    speed: getStableDownloadSpeed(bytesPerSecond),
  });
  const percent = (sumTransferredBytes / sumTotalBytes) * 100;

  if (installHasError || !isDownloading(downloadProgressInfo)) {
    const progressLabel = t("download.unzipResult", {
      unzippedSize: convertBytesToMBorGB(install.progress.unzippedBytes),
      totalSize: convertBytesToMBorGB(install.progress.totalBytes),
    });
    const label = t(`download.installStatus.${install.status}`, {
      reason: install.progress.interruptReason
        ? t(`download.interruptReason.${install.progress.interruptReason}`)
        : t("download.interruptReason.unknown"),
      version: internalVersion,
    });
    const progressVariant = getProgressVariant(install.status);
    const variant = getLabelVariant(install.status);
    return {
      label,
      variant,
      progressVariant,
      progressLabel,
      percent,
      status,
      installProgress: install,
      isPaused,
      internalVersion,
    };
  } else {
    const progressLabel = t("download.downloadedProgress", {
      downloadedSize: convertBytesToMBorGB(sumTransferredBytes),
      totalSize: convertBytesToMBorGB(sumTotalBytes),
      speed: convertBytesToKB(getStableDownloadSpeed(bytesPerSecond)),
    });

    const label = status
      ? status === "progressing" || status === "completed"
        ? isPaused
          ? t("download.paused")
          : t("download.status.progressing", {
              remainingMinutes,
              remainingSeconds,
            })
        : t(`download.status.${status}`, {
            reason: interruptReason
              ? interruptReason.startsWith("serverError")
                ? t(`download.interruptReason.serverError`, {
                    reason: interruptReason.split(" - ")[1],
                  })
                : t(`download.interruptReason.${interruptReason}`)
              : t("download.interruptReason.unknown"),
          })
      : "";

    const variant = getLabelVariant(status);
    const progressVariant = getProgressVariant(status);
    return {
      label,
      variant,
      progressVariant,
      progressLabel,
      percent,
      status,
      installProgress: install,
      isPaused,
      internalVersion,
    };
  }
};

const DownloadStatusLabel = ({
  status,
  isPaused,
  clientId,
  downloadInitTime,
  internalVersion,
}: {
  status: DownloadStatus;
  isPaused: boolean;
  clientId: GameClientId;
  downloadInitTime: number;
  internalVersion: number;
}): JSX.Element => {
  const { resume, pause, cancel, retry } = useDownloadActions(
    clientId,
    downloadInitTime,
    internalVersion,
  );
  const { t } = useTranslation();
  const shouldShowContinueDownload =
    (status === "progressing" && isPaused) || status === "interrupted";
  const shouldShowPauseButton = status === "progressing" && !isPaused;
  return (
    <>
      {shouldShowContinueDownload && (
        <Button onClick={() => resume()} size="icon-sm" variant="ghost">
          {status === "progressing" ? (
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CirclePlay className="h-4 w-4" strokeWidth={2.5} />
                </TooltipTrigger>
                <TooltipContent className="">
                  <p>{t("actions.continue")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
          )}
        </Button>
      )}
      {shouldShowPauseButton && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => pause()} size="icon-sm" variant="ghost">
                <CirclePause className="h-4 w-4" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="">
              <p>{t("download.paused")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {(status === "progressing" || status === "interrupted") && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={() => cancel()} size="icon-sm" variant="ghost">
                <CircleStop className="h-4 w-4" strokeWidth={2.5} />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="">
              <p>{t("download.cancel")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {status === "cancelled" && (
        <Button onClick={() => retry()} size="icon-sm" variant="ghost">
          <RefreshCcw className="h-4 w-4" strokeWidth={2.5} />
        </Button>
      )}
    </>
  );
};

const InstallStatusLabel = ({
  clientId,
  authType,
  metadata,
  installProgress,
  makeSureTheMenuIsClosed,
  gameUpdateInfo,
  downloadInitTime,
  internalVersion,
}: {
  clientId: GameClientId;
  authType: ProductAuthType;
  metadata: DetailsPageGameInfo["metadata"];
  installProgress: DownloadProgressInfo["progress"][number]["install"];
  makeSureTheMenuIsClosed: () => void;
  gameUpdateInfo: GameUpdateInfo;
  downloadInitTime: number;
  internalVersion: number;
}): JSX.Element => {
  const { t } = useTranslation();
  const { play, shouldDisablePlay } = useGameActions(clientId, authType, metadata, gameUpdateInfo);
  const { retry } = useDownloadActions(clientId, downloadInitTime, internalVersion);
  return (
    <>
      {(installProgress.status === "Unzip Failed" || installProgress.status === "Invalid File") && (
        <Button onClick={() => retry()} variant="outline">
          {t("actions.retry")}
        </Button>
      )}

      {installProgress.status === "Deeplink Registered" && (
        <Button
          disabled={shouldDisablePlay}
          onClick={() => {
            // This is to cover a case where the user hasn't logged in yet and the play function triggers the force login dialog on a webview page
            // .
            // Without this function call, when the dialog opens, the menu automatically closes AFTER the dialog opens.
            // When opening a webview above main app (webshop/myaccount), this behavior results in:
            // force login dialog opens -> bring app to front -> menu closes -> bring app to back => the app is behind the webview
            // .
            // With this function call, we make sure the menu closes first and then the dialog opens, which results in:
            // menu closes -> bring app to back -> play -> force login opens -> bring app to front
            makeSureTheMenuIsClosed();

            void play("download_finish");
          }}
          variant="outline"
          size="sm"
          className="body-14-regular"
        >
          {t("actions.play")}
        </Button>
      )}
    </>
  );
};

const DownloadSubscriber = ({
  clientId,
  authType,
  metadata,
  downloadInitTime,
  makeSureTheMenuIsClosed,
  allowedActions = true,
  gameUpdateInfo,
}: {
  clientId: GameClientId;
  authType: ProductAuthType;
  metadata: DetailsPageGameInfo["metadata"];
  downloadInitTime: number;
  makeSureTheMenuIsClosed: () => void;
  allowedActions?: boolean;
  gameUpdateInfo: GameUpdateInfo;
}): JSX.Element | null => {
  const {
    percent,
    progressLabel,
    progressVariant,
    label,
    variant,
    status,
    installProgress,
    isPaused,
    internalVersion,
  } = useDownloadLabels(clientId);
  return (
    <>
      <div className="flex w-full gap-2">
        <div className="flex flex-grow flex-col gap-2">
          <Label className={`${status === "cancelled" ? "line-through" : ""} caption-12-regular`}>
            {progressLabel}
          </Label>
          <div className="flex items-center gap-2">
            <Progress
              value={percent}
              variant={progressVariant}
              size="download"
              // className="max-w-80"
            />
          </div>
          <Label className="caption-12-regular" variant={variant}>
            {label}
          </Label>
        </div>
        {allowedActions && (
          <div className="flex items-center justify-center">
            <DownloadStatusLabel
              clientId={clientId}
              status={status}
              isPaused={isPaused}
              downloadInitTime={downloadInitTime}
              internalVersion={internalVersion}
            />
            <InstallStatusLabel
              downloadInitTime={downloadInitTime}
              internalVersion={internalVersion}
              clientId={clientId}
              authType={authType}
              metadata={metadata}
              installProgress={installProgress}
              makeSureTheMenuIsClosed={makeSureTheMenuIsClosed}
              gameUpdateInfo={gameUpdateInfo}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default DownloadSubscriber;
