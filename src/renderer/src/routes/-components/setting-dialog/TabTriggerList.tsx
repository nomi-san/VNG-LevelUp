import { Bell, Download, Info, Settings } from "lucide-react";

import { TabsList, TabsTrigger } from "@renderer/components/ui/tabs";
import { useTranslation } from "@renderer/i18n/useTranslation";

export const TabTriggerList = (): JSX.Element => {
  const { t } = useTranslation();
  return (
    <>
      <p className="heading-4 mb-3 px-2">{t("appSetting.title")}</p>
      <TabsList className="flex flex-col gap-1">
        <TabsTrigger value="general-setting" className="flex h-9 items-center gap-2 px-2 py-1.5">
          <Settings className="h-4 w-4" strokeWidth={2.5} />
          <p>{t("appSetting.generalSetting.title")}</p>
        </TabsTrigger>
        <TabsTrigger value="download-setting" className="flex h-9 items-center gap-2 px-2 py-1.5">
          <Download className="h-4 w-4" strokeWidth={2.5} />
          <p>{t("appSetting.downloadSetting.title")}</p>
        </TabsTrigger>
        <TabsTrigger
          value="notification-setting"
          className="flex h-9 items-center gap-2 px-2 py-1.5"
        >
          <Bell className="h-4 w-4" strokeWidth={2.5} />
          <p>{t("appSetting.notificationSetting.title")}</p>
        </TabsTrigger>
        <TabsTrigger value="addition-info" className="flex h-9 items-center gap-2 px-2 py-1.5">
          <Info className="h-4 w-4" strokeWidth={2.5} />
          <p>{t("appSetting.additionInfo.title")}</p>
        </TabsTrigger>
      </TabsList>
    </>
  );
};
