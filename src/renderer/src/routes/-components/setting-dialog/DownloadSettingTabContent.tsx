import { useLayoutEffect, useState } from "react";

import { Button } from "@renderer/components/ui/button";
import { Input } from "@renderer/components/ui/input";
import { Label } from "@renderer/components/ui/label";
import { TabsContent } from "@renderer/components/ui/tabs";
import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { useTranslation } from "@renderer/i18n/useTranslation";

export const DownloadSettingTabContent = (): JSX.Element => {
  const { t } = useTranslation();

  const [gameDirectory, setGameDirectory] = useState("");

  const onChangeDefaultGameDirSetting = async (): Promise<void> => {
    const result = await window.api.selectFolder({});
    if (!result) return;
    const { selectedDir } = result;
    setGameDirectory(selectedDir);
    void window.api.store_setDefaultGameDir(selectedDir);
  };

  const isUnmounted = useIsUnmountedRef();
  useLayoutEffect(() => {
    if (isUnmounted.current) return;

    void window.api.store_getDefaultGameDir({}).then((result) => {
      if (!result) return;
      const { selectedDir } = result;
      setGameDirectory(selectedDir);
    });
  }, [isUnmounted]);
  return (
    <TabsContent value="download-setting">
      <p className="heading-4 mb-6">{t("appSetting.downloadSetting.title")}</p>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <p className="body-14-bold">{t("appSetting.downloadSetting.defaultDownloadDir.title")}</p>
          <div className="flex items-center justify-between">
            <Label className="body-14-regular">
              {t("appSetting.downloadSetting.defaultDownloadDir.action")}
            </Label>
            <div className="flex items-center justify-center gap-2">
              <Input
                className="w-[263px]"
                disabled={true}
                placeholder="Choose a folder"
                id="path"
                customSize="medium"
                value={gameDirectory}
                onChange={() => {}}
              />
              <Button onClick={onChangeDefaultGameDirSetting} variant="outline">
                {t("download.changeDir")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
};
