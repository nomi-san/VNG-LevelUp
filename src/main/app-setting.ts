import { app, ipcMain, nativeImage, Notification } from "electron";

import {
  FROM_RENDERER_GET_CLOSE_SETTING,
  FROM_RENDERER_GET_NOTIFICATION_PERMISSION,
  FROM_RENDERER_GET_OPEN_AT_LOGIN_SETTING,
  FROM_RENDERER_SEND_NOTIFICATION,
  FROM_RENDERER_SET_CLOSE_SETTING,
  FROM_RENDERER_SET_NOTIFICATION_PERMISSION,
  FROM_RENDERER_SET_OPEN_AT_LOGIN_SETTING,
} from "@src/const/events";
import type {
  CloseWindowSetting,
  NotificationPayload,
  NotificationPermission,
} from "@src/types/app-settings";

import notiImage from "../../resources/noti_image.png?asset";
import launcherStore from "./store";

export const handleAppSettings = (): void => {
  ipcMain.handle(FROM_RENDERER_GET_OPEN_AT_LOGIN_SETTING, async (): Promise<boolean> => {
    const currentSettings = app.getLoginItemSettings();
    const appSetting = currentSettings.executableWillLaunchAtLogin && currentSettings.openAtLogin;
    return appSetting;
  });
  ipcMain.on(FROM_RENDERER_SET_OPEN_AT_LOGIN_SETTING, (_, openAtLogin: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: openAtLogin,
    });
  });
  ipcMain.handle(FROM_RENDERER_GET_CLOSE_SETTING, async (): Promise<CloseWindowSetting> => {
    return launcherStore.getCloseSetting();
  });
  ipcMain.handle(FROM_RENDERER_SET_CLOSE_SETTING, (_, setting: CloseWindowSetting) => {
    launcherStore.setCloseSetting(setting);
  });
  ipcMain.on(FROM_RENDERER_SEND_NOTIFICATION, (_, { title, body }: NotificationPayload) => {
    const permission = launcherStore.getNotificationPermission();
    if (permission === "DENIED") return;
    new Notification({ title, body, icon: nativeImage.createFromPath(notiImage) }).show();
  });
  ipcMain.handle(
    FROM_RENDERER_GET_NOTIFICATION_PERMISSION,
    async (): Promise<NotificationPermission> => {
      return launcherStore.getNotificationPermission();
    },
  );
  ipcMain.handle(
    FROM_RENDERER_SET_NOTIFICATION_PERMISSION,
    (_, permission: NotificationPermission) => {
      launcherStore.setNotificationPermission(permission);
    },
  );
};
