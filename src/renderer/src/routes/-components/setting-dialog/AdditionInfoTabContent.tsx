import { useEffect } from "react";

import { TabsContent } from "@renderer/components/ui/tabs";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useAppConfig } from "@renderer/providers/AppConfigProvider";
import { useAppUpdateProvider } from "@renderer/providers/AppUpdateProvider";

const AppUpdatesInfo = () => {
  const { t } = useTranslation();
  const { version, appUpdateInfo } = useAppUpdateProvider();

  const makeCurrentUpdateEventLabel = (): string => {
    if (!appUpdateInfo) return "";
    switch (appUpdateInfo.currentUpdateEvent) {
      case "checking-for-update":
        return t("appSetting.additionInfo.update.checking");
      case "update-not-available":
        return t("appSetting.additionInfo.update.notAvailable");
      case "update-available":
        return t("appSetting.additionInfo.update.available");
      case "update-downloaded":
        return t("appSetting.additionInfo.update.downloaded");
      case "download-progress":
        return (
          t("appSetting.additionInfo.update.downloadProgress") +
          ` ${Math.floor(appUpdateInfo.info.percent)}%`
        );
      case "update-cancelled":
        return t("appSetting.additionInfo.update.cancelled");
      case "appimage-filename-updated":
        return t("appSetting.additionInfo.update.appimageFilenameUpdated");
      case "error":
        return t("appSetting.additionInfo.update.error");
      default:
        return "";
    }
  };
  useEffect(() => {
    window.api.app_checkForUpdate();
  }, []);

  return (
    <p className="body-14-regular opacity-50">
      <span>{`${t("appSetting.additionInfo.currentVersion")}: ${version}`}</span>
      {appUpdateInfo ? <span>{` (${makeCurrentUpdateEventLabel()})`}</span> : null}
    </p>
  );
};
export const AdditionInfoTabContent = (): JSX.Element => {
  const { t } = useTranslation();
  const { externalUrl } = useAppConfig();
  return (
    <TabsContent value="addition-info">
      <p className="heading-4 mb-6">{t("appSetting.additionInfo.title")}</p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <AppUpdatesInfo />
          <p
            className="body-14-regular cursor-pointer py-1"
            onClick={() => {
              window.api.app_openExternalWeb(externalUrl.tos);
            }}
          >
            {t("appSetting.additionInfo.tos")}
          </p>
          <p
            className="body-14-regular cursor-pointer py-1"
            onClick={() => {
              window.api.app_openExternalWeb(externalUrl.privacy);
            }}
          >
            {t("appSetting.additionInfo.privacyOfPolicy")}
          </p>
        </div>
      </div>
    </TabsContent>
  );
};
