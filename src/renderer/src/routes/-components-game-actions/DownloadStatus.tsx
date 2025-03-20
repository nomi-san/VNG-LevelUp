import { RefreshCw, X } from "lucide-react";

import pauseIcon from "@renderer/assets/download/pause.svg";
import playIcon from "@renderer/assets/download/play.svg";
import type { ButtonGroupChildrenExtraProps } from "@renderer/components/ButtonGroup";
import { Button } from "@renderer/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@renderer/components/ui/tooltip";
import useDownloadActions from "@renderer/hooks/useDownloadActions";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { cn } from "@renderer/lib/utils";
import { useDownloadLabels } from "@renderer/routes/-components/download/DownloadSubscriber";
import { isDownloadContainingErrors, isInstallContainingErrors } from "@renderer/utils/download";

import type { DownloadProgressInfo } from "@src/types/system";

import { GameActionContainer } from "./GameCardAction";

export const DownloadStatus = ({
  downloadProgressInfo,
}: {
  downloadProgressInfo: DownloadProgressInfo;
}): JSX.Element => {
  const currentDownloadIndex = downloadProgressInfo.currentDownloadIndex;
  const currentDownloadItem = downloadProgressInfo.progress[currentDownloadIndex];

  const { resume, pause, cancel, retry } = useDownloadActions(
    downloadProgressInfo.initInfo.gameClientId,
    downloadProgressInfo.initInfo.downloadInitTime,
    currentDownloadItem.internalVersion,
  );

  const isDownloadError = isDownloadContainingErrors(downloadProgressInfo);
  const isInstallError = isInstallContainingErrors(downloadProgressInfo);

  if (isDownloadError || isInstallError) {
    return (
      <GameActionContainer
        gameId={downloadProgressInfo.initInfo.gameClientId}
        playButton={
          <ErrorButton
            downloadProgressInfo={downloadProgressInfo}
            onClick={() => {
              if (isDownloadError || isInstallError) {
                retry();
              }
            }}
          />
        }
        gameMenuButton={<CancelButton isDownloadError={true} onCancel={() => cancel()} />}
      />
    );
  }

  const downloadingItemIndex = downloadProgressInfo.progress.findIndex(
    ({ download }) => download.status === "progressing",
  );

  if (
    downloadingItemIndex ||
    currentDownloadItem.download.status === "progressing" ||
    currentDownloadItem.install.status === "Deeplink Registered" // TODO: can consider make a UI for success case
  ) {
    const shouldShowMenuButton =
      currentDownloadItem.download.isPaused ||
      currentDownloadItem.download.status === "initializing";
    return (
      <GameActionContainer
        gameId={downloadProgressInfo.initInfo.gameClientId}
        playButton={
          <DownloadingButton
            downloadProgressInfo={downloadProgressInfo}
            onClick={() => {
              !currentDownloadItem.download.isPaused ? pause() : resume();
            }}
          />
        }
        gameMenuButton={
          shouldShowMenuButton ? (
            <CancelButton isDownloadError={false} onCancel={() => cancel()} />
          ) : null
        }
      />
    );
  }

  return (
    <GameActionContainer
      gameId={downloadProgressInfo.initInfo.gameClientId}
      playButton={<UnzippingButton downloadProgressInfo={downloadProgressInfo} />}
    />
  );
};

const CancelButton = ({
  className,
  isDownloadError,
  onCancel,
}: {
  className?: string;
  isDownloadError: boolean;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            `w-14 min-w-14 border-l-2 ${isDownloadError ? "border-l-[#f56565]" : "border-l-neutral-200"}`,
            className,
          )}
          asChild
        >
          <Button
            variant={isDownloadError ? "destructive" : "white"}
            size="downloadCTA"
            className="h-full w-14"
            onClick={() => onCancel()}
          >
            <X className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="body-14-regular bg-neutral-800 text-white">
          <p>{t("download.cancel")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ErrorButton = ({
  downloadProgressInfo,
  onClick,
  isInButtonGroup,
  className,
  size,
}: {
  downloadProgressInfo: DownloadProgressInfo;
  onClick: () => void;
} & ButtonGroupChildrenExtraProps): JSX.Element => {
  return (
    <Button
      variant="destructive"
      size={size ? size : "lg"}
      className={cn("grow", className)}
      onClick={onClick}
    >
      <DownloadLabelWrapper
        downloadProgressInfo={downloadProgressInfo}
        icon={<RefreshCw className="h-6 w-6" />}
        shouldHideProgressLabel={!isInButtonGroup}
      />
    </Button>
  );
};

const DownloadingButton = ({
  downloadProgressInfo,
  onClick,
  isInButtonGroup,
  className,
  size,
}: {
  downloadProgressInfo: DownloadProgressInfo;
  onClick: () => void;
} & ButtonGroupChildrenExtraProps): JSX.Element => {
  return (
    <Button
      variant="white"
      size={size ? size : "lg"}
      className={cn("grow !font-bold", className)}
      onClick={onClick}
    >
      <DownloadLabelWrapper
        downloadProgressInfo={downloadProgressInfo}
        icon={
          downloadProgressInfo.progress.some(({ download }) => download.isPaused) ? (
            <img src={playIcon} className="min-h-6 min-w-6" />
          ) : (
            <img src={pauseIcon} className="min-h-6 min-w-6" />
          )
        }
        shouldHideProgressLabel={!isInButtonGroup}
      />
    </Button>
  );
};

const UnzippingButton = ({
  downloadProgressInfo,
  isInButtonGroup,
  className,
  size,
}: {
  downloadProgressInfo: DownloadProgressInfo;
} & ButtonGroupChildrenExtraProps): JSX.Element => {
  const { t } = useTranslation();
  return (
    <Button variant="white" size={size ? size : "lg"} className={cn("grow", className)} disabled>
      <DownloadLabelWrapper
        downloadProgressInfo={downloadProgressInfo}
        shouldHideProgressLabel={!isInButtonGroup}
      >
        <p className="text-left">{t("download.installStatus.Unziping")}</p>
      </DownloadLabelWrapper>
    </Button>
  );
};

const TooltipWrapper = ({
  children,
  shouldUseTooltip,
  tooltip,
}: {
  children: React.ReactNode;
  shouldUseTooltip?: boolean;
  tooltip: React.ReactNode;
}) => {
  if (shouldUseTooltip) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>
          <TooltipContent className="">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return children;
};
const DownloadLabelWrapper = ({
  icon,
  children,
  downloadProgressInfo,
  shouldHideProgressLabel,
}: {
  icon?: React.ReactNode;
  children?: React.ReactNode;
  downloadProgressInfo: DownloadProgressInfo;
  shouldHideProgressLabel?: boolean;
}): JSX.Element => {
  const { label, progressLabel } = useDownloadLabels(downloadProgressInfo.initInfo.gameClientId);
  const { t } = useTranslation();
  const isDownloadError = isDownloadContainingErrors(downloadProgressInfo);

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        className={`flex h-full w-full items-center gap-3 ${shouldHideProgressLabel ? "" : "p-6"}`}
      >
        {icon ? <div className="flex h-full items-center justify-center">{icon}</div> : <></>}
        <div className="flex h-full w-full flex-col justify-center gap-0.5">
          {children ?? (
            <p
              className={`w-full max-w-[250px] overflow-clip text-ellipsis whitespace-nowrap text-left ${isDownloadError ? "text-neutral-50" : ""}`}
            >
              {isDownloadError ? t("actions.retry") : label}
            </p>
          )}
          {shouldHideProgressLabel ? (
            <></>
          ) : (
            <TooltipWrapper shouldUseTooltip={isDownloadError} tooltip={label}>
              <p
                className={`caption-12-regular w-full max-w-[215px] overflow-clip text-ellipsis whitespace-nowrap text-left ${isDownloadError ? "text-red-200" : "text-neutral-600"}`}
              >
                {isDownloadError ? label : progressLabel}
              </p>
            </TooltipWrapper>
          )}
        </div>
      </div>
    </div>
  );
};
