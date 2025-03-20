import { Tabs } from "@renderer/components/ui/tabs";

import { AdditionInfoTabContent } from "./AdditionInfoTabContent";
import { DownloadSettingTabContent } from "./DownloadSettingTabContent";
import { GeneralSettingTabContent } from "./GeneralSettingTabContent";
import { NotificationSettingTabContent } from "./NotificationSettingTabContent";
import { TabTriggerList } from "./TabTriggerList";

export const SettingDialogContent = (): JSX.Element => {
  return (
    <Tabs
      defaultValue="general-setting"
      className="m-0 flex h-[436px] w-full overflow-hidden rounded-xl p-0"
    >
      <div className="flex h-full w-[200px] flex-col bg-neutral-900 px-4 py-6">
        <TabTriggerList />
      </div>
      <div className="flex h-full w-[534px] flex-col bg-neutral-800 p-6">
        <GeneralSettingTabContent />
        <DownloadSettingTabContent />
        <NotificationSettingTabContent />
        <AdditionInfoTabContent />
      </div>
    </Tabs>
  );
};
