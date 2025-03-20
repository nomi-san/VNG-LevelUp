import { useLayoutEffect, useRef, useState } from "react";

import { Checkbox } from "@renderer/components/ui/checkbox";
import { Label } from "@renderer/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@renderer/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@renderer/components/ui/select";
import { TabsContent } from "@renderer/components/ui/tabs";
import { useTranslation } from "@renderer/i18n/useTranslation";

import { LANGUAGE_SUPPORTED, type SupportedLanguage } from "@src/const/language";
import type { CloseWindowSetting } from "@src/types/app-settings";

import { RecommendationCard } from "./RecommendationCard";

export const GeneralSettingTabContent = (): JSX.Element => {
  const [openAtLoginSetting, setOpenAtLoginSetting] = useState<boolean>(false);
  const [closeSetting, setCloseSetting] = useState<CloseWindowSetting>("MINIMIZE_TO_TRAY");
  const [languageSetting, setLanguageSetting] = useState<SupportedLanguage>("vi");

  const { t } = useTranslation();

  const onChangeAutoOpenOnStartSetting = (value: boolean): void => {
    setOpenAtLoginSetting(value);
    window.api.setOpenAtLoginSetting(value);
  };
  const onChangeCloseSetting = (value: CloseWindowSetting): void => {
    setCloseSetting(value);
    void window.api.store_setCloseSetting(value);
  };

  const isUnmounted = useRef(false);

  useLayoutEffect(() => {
    if (isUnmounted.current) return;

    setLanguageSetting("vi");

    void window.api.getOpenAtLoginSetting().then((result) => {
      if (!result) return;
      setOpenAtLoginSetting(result);
    });

    void window.api.store_getCloseSetting().then((result) => {
      if (!result) return;
      setCloseSetting(result);
    });

    return () => {
      isUnmounted.current = true;
    };
  }, []);
  return (
    <TabsContent value="general-setting">
      <p className="heading-4 mb-6">{t("appSetting.generalSetting.title")}</p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="body-14-bold">{t("appSetting.generalSetting.language.title")}</p>
          <div className="flex items-center justify-between">
            <Label className="body-14-regular">
              {t("appSetting.generalSetting.language.action")}
            </Label>
            <Select value={languageSetting} onValueChange={() => {}} disabled>
              <SelectTrigger className="w-40">
                <SelectValue
                  placeholder={t(
                    `appSetting.generalSetting.language.supportedLangs.${languageSetting}`,
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_SUPPORTED.map((val) => (
                  <SelectItem key={val} value={val}>
                    {t(`appSetting.generalSetting.language.supportedLangs.${languageSetting}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <hr className="border-b border-b-neutral-600" />
        <div className="flex flex-col gap-1.5">
          <p className="body-14-bold">{t("appSetting.generalSetting.openOnStart.title")}</p>
          <div className="flex items-center justify-between">
            <Label className="body-14-regular flex items-center gap-2">
              {t("appSetting.generalSetting.openOnStart.action")} <RecommendationCard />
            </Label>
            <Checkbox
              checked={openAtLoginSetting}
              onCheckedChange={onChangeAutoOpenOnStartSetting}
            />
          </div>
        </div>
        <hr className="border-b border-b-neutral-600" />
        <div className="flex flex-col gap-1.5">
          <p className="body-14-bold">{t("appSetting.generalSetting.closeWindow.title")}</p>
          <div className="flex flex-col gap-2.5">
            <RadioGroup value={closeSetting} onValueChange={onChangeCloseSetting}>
              <div className="flex items-center justify-between">
                <Label className="body-14-regular flex items-center gap-2">
                  {t("appSetting.generalSetting.closeWindow.action.minimize")}
                  <RecommendationCard />
                </Label>
                <RadioGroupItem value="MINIMIZE_TO_TRAY" id="MINIMIZE_TO_TRAY" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="body-14-regular flex gap-2">
                  {t("appSetting.generalSetting.closeWindow.action.exit")}
                </Label>
                <RadioGroupItem value="EXIT_LAUNCHER" id="EXIT_LAUNCHER" />
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};
