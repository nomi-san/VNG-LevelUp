import { app, ipcMain } from "electron";

import { FROM_RENDERER_GET_INFO_FOR_ANALYTICS } from "@src/const/events";
import type { InfoForAnalytics } from "@src/types/analytics";

import { envNode } from "./env-node";
import launcherStore from "./store";

export const handleAnalytics = (): void => {
  ipcMain.handle(FROM_RENDERER_GET_INFO_FOR_ANALYTICS, () => {
    const data: InfoForAnalytics = {
      platform: process.platform,
      appVersion: app.getVersion(),
      appOpenTime: launcherStore.getAppOpenTime(),
      environment: envNode.environment,
    };

    return data;
  });
};
