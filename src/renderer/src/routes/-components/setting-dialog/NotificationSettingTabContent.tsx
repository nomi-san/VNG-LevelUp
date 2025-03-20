import { useLayoutEffect, useRef, useState } from "react";

import { Checkbox } from "@renderer/components/ui/checkbox";
import { Label } from "@renderer/components/ui/label";
import { TabsContent } from "@renderer/components/ui/tabs";
import { useTranslation } from "@renderer/i18n/useTranslation";

import type { NotificationPermission } from "@src/types/app-settings";

import { RecommendationCard } from "./RecommendationCard";

export const NotificationSettingTabContent = (): JSX.Element => {
  const { t } = useTranslation();

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("GRANTED");

  const onChangeNotificationPermission = (value: boolean): void => {
    const newNotificationPermission: NotificationPermission = value ? "GRANTED" : "DENIED";
    setNotificationPermission(newNotificationPermission);
    void window.api.store_setNotificationPermission(newNotificationPermission);
  };

  const isUnmounted = useRef(false);

  useLayoutEffect(() => {
    if (isUnmounted.current) return;

    void window.api.store_getNotificationPermission().then((result) => {
      if (!result) return;
      setNotificationPermission(result);
    });

    return () => {
      isUnmounted.current = true;
    };
  }, []);
  return (
    <TabsContent value="notification-setting">
      <p className="heading-4 mb-6">{t("appSetting.notificationSetting.title")}</p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="body-14-bold">
            {t("appSetting.notificationSetting.grantedNotification.title")}
          </p>
          <div className="flex items-center justify-between">
            <Label className="body-14-regular flex items-center gap-2">
              {t("appSetting.notificationSetting.grantedNotification.action")}
              <RecommendationCard />
            </Label>
            <Checkbox
              checked={notificationPermission === "GRANTED"}
              onCheckedChange={onChangeNotificationPermission}
            />
          </div>
        </div>
      </div>
    </TabsContent>
  );
};
