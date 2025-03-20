import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@renderer/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@renderer/components/ui/dialog";
import { Label } from "@renderer/components/ui/label";
import useWebviewArranger from "@renderer/hooks/useWebviewArranger";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useDownloadQueueProvider } from "@renderer/providers/DownloadProvider";

import { FROM_NODE_WARN_USER_TO_CHECK_DOWNLOADS_WHEN_CLOSING_APP } from "@src/const/events";

const WarnBeforeQuit = ({
  onClickContinueDownload,
}: {
  onClickContinueDownload: () => void;
}): JSX.Element => {
  const { t } = useTranslation();
  return (
    <div className="p-6">
      <div className="heading-4 mb-2">{t("download.warnBeforeQuitTitle")}</div>

      <Label className="body-14-regular mb-8 block">
        {t("download.warnBeforeQuitDescription")}
      </Label>

      <div className="flex justify-end">
        <Button
          size="lg"
          variant="ghost"
          className="mr-2"
          onClick={() => {
            window.api.app_close();
          }}
        >
          {t("download.quitApp")}
        </Button>
        <Button
          size="lg"
          className="px-7"
          variant="white"
          onClick={() => {
            onClickContinueDownload();
          }}
        >
          {t("download.continueDownload")}
        </Button>
      </div>
    </div>
  );
};

export const WarnBeforeQuitDialog = (): JSX.Element | null => {
  const { downloadsList } = useDownloadQueueProvider();
  const [isOpen, _setIsOpen] = useState(false);
  const { onFocusAppNavBar } = useWebviewArranger();
  const setIsOpen = useCallback(
    (open: boolean) => {
      _setIsOpen(open);
      onFocusAppNavBar(open);
    },
    [onFocusAppNavBar],
  );

  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_WARN_USER_TO_CHECK_DOWNLOADS_WHEN_CLOSING_APP,
      () => {
        setIsOpen(true);
      },
    );
  }, [setIsOpen]);

  if (downloadsList.length === 0) return <></>;
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(open);
        }
      }}
    >
      <DialogTrigger></DialogTrigger>
      <DialogContent
        className="w-[448px] rounded-xl p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <VisuallyHidden>
          <DialogTitle></DialogTitle>
        </VisuallyHidden>
        <WarnBeforeQuit
          onClickContinueDownload={() => {
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default WarnBeforeQuit;
