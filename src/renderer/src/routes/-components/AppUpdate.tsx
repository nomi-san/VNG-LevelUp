import { useState, type ReactNode } from "react";

import logoWithBg from "@renderer/assets/logo-with-bg.svg";
import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import { Label } from "@renderer/components/ui/label";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useAppUpdateProvider } from "@renderer/providers/AppUpdateProvider";

export const CurrentVersion = (): string => {
  const { version } = useAppUpdateProvider();

  return version || "";
};

const UpdateDownloadedDialog = (): JSX.Element => {
  const [isOpened, setIsOpened] = useState(true);
  const { t } = useTranslation();
  return (
    <Dialog
      open={isOpened}
      onOpenChange={(open) => {
        setIsOpened(open);
      }}
    >
      <DialogContent className="w-[448px]">
        <DialogHeader className="mb-3">
          <DialogDescription className="flex flex-col items-center justify-center">
            <img
              src={logoWithBg}
              alt={t("altLauncherLogoImg")}
              className="mb-4 h-[60px] w-[60px]"
            ></img>
          </DialogDescription>
          <DialogTitle className="heading-4 mb-2">{t("update.updateNewVersion")}</DialogTitle>

          <DialogDescription>
            <Label className="body-14-regular">{t("update.description")}</Label>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setIsOpened(false)} variant="ghost" size="lg" tabIndex={-1}>
            {t("update.later")}
          </Button>
          <Button
            onClick={() => {
              window.api.app_triggerUpdate();
            }}
            variant="white"
            size="lg"
          >
            {t("update.now")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const AppUpdateMenu = (): ReactNode => {
  const { appUpdateInfo } = useAppUpdateProvider();
  if (!appUpdateInfo) return <></>;

  const { currentUpdateEvent } = appUpdateInfo;

  if (currentUpdateEvent === "update-downloaded") {
    return <UpdateDownloadedDialog />;
  }
  return null;
};

export default AppUpdateMenu;
