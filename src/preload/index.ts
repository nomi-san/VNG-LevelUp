import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

import {
  FROM_RENDERER_APP_ATTEMPT_TO_CLOSE,
  FROM_RENDERER_APP_CHECK_FOR_UPDATE,
  FROM_RENDERER_APP_CLOSE,
  FROM_RENDERER_APP_GET_VERSION,
  FROM_RENDERER_APP_MINIMIZE,
  FROM_RENDERER_APP_MINIMIZE_TO_TRAY,
  FROM_RENDERER_APP_TRIGGER_INSTALL_UPDATE,
  FROM_RENDERER_CHECK_FOR_AVAILABLE_STORAGE,
  FROM_RENDERER_CREATE_DESKTOP_SHORTCUT,
  FROM_RENDERER_DEEPLINK_REGISTER,
  FROM_RENDERER_DIALOG_SELECT_DIR,
  FROM_RENDERER_EXTRACT_ZIP,
  FROM_RENDERER_FOCUS_WEBVIEW,
  FROM_RENDERER_GAME_DOWNLOAD_CANCEL,
  FROM_RENDERER_GAME_DOWNLOAD_GET_ALL_DOWNLOADS,
  FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS,
  FROM_RENDERER_GAME_DOWNLOAD_PAUSE,
  FROM_RENDERER_GAME_DOWNLOAD_REMOVE_WHEN_INSTALL_SUCCESS,
  FROM_RENDERER_GAME_DOWNLOAD_RESUME,
  FROM_RENDERER_GAME_DOWNLOAD_RETRY,
  FROM_RENDERER_GAME_DOWNLOAD_START,
  FROM_RENDERER_GET_CLOSE_SETTING,
  FROM_RENDERER_GET_DEFAULT_GAME_DIR,
  FROM_RENDERER_GET_GAME_SESSION_STATUS,
  FROM_RENDERER_GET_GUEST_ID,
  FROM_RENDERER_GET_INFO_FOR_ANALYTICS,
  FROM_RENDERER_GET_MINIGAMES,
  FROM_RENDERER_GET_NOTIFICATION_PERMISSION,
  FROM_RENDERER_GET_OPEN_AT_LOGIN_SETTING,
  FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE,
  FROM_RENDERER_GET_USER_SESSION,
  FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES,
  FROM_RENDERER_LOGIN_PAGE_MOUNT,
  FROM_RENDERER_OPEN_EXTERNAL_WEB,
  FROM_RENDERER_PAGE_ACCOUNT_BACK,
  FROM_RENDERER_PAGE_ACCOUNT_FORWARD,
  FROM_RENDERER_PAGE_ACCOUNT_MOUNT,
  FROM_RENDERER_PAGE_ACCOUNT_UNMOUNT,
  FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_MOUNT,
  FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_UNMOUNT,
  FROM_RENDERER_PAGE_SHOP_BACK,
  FROM_RENDERER_PAGE_SHOP_FORWARD,
  FROM_RENDERER_PAGE_SHOP_MOUNT,
  FROM_RENDERER_PAGE_SHOP_UNMOUNT,
  FROM_RENDERER_PLAY_MINIGAME,
  FROM_RENDERER_RECONNECT_TO_NETWORK,
  FROM_RENDERER_REDEEM_CODE,
  FROM_RENDERER_RETURN_REQUEST_RESULT,
  FROM_RENDERER_SEND_LOG,
  FROM_RENDERER_SEND_NOTIFICATION,
  FROM_RENDERER_SET_CLOSE_SETTING,
  FROM_RENDERER_SET_DEFAULT_GAME_DIR,
  FROM_RENDERER_SET_NOTIFICATION_PERMISSION,
  FROM_RENDERER_SET_OPEN_AT_LOGIN_SETTING,
  FROM_RENDERER_START_NATIVE_GAME,
  FROM_RENDERER_STORE_CLEAR_GAME_INFO,
  FROM_RENDERER_STORE_GET_ALL_GAME_IDS,
  FROM_RENDERER_STORE_GET_GAME_INFO,
  FROM_RENDERER_SUBMIT_SURVEY_QUESTION_ANSWER,
  FROM_RENDERER_UNINSTALL_GAME,
  FROM_RENDERER_USER_LOGOUT,
  FROM_RENDERER_USER_PLAY_GAME_TO_REDEEM,
  type ShowEmbeddedGameArgs,
} from "@src/const/events";
import { envNode } from "@src/main/env-node";
import type {
  CloseWindowSetting,
  NotificationPayload,
  NotificationPermission,
} from "@src/types/app-settings";
import type { LoginStateInfo } from "@src/types/auth";
import type { CommonEventParams } from "@src/types/common";
import type { DetailsPageGameInfo, GameClientId } from "@src/types/game";
import type { PlayNativeGameParams, UninstallGameParams } from "@src/types/native-game";
import type { SetRedeemCodeInfo } from "@src/types/redeem";
import type { ResultFromRendererToNode } from "@src/types/request";
import type {
  DeepLinkRegisterParams,
  DownloadInitInfo,
  DownloadItemInteractionParams,
  FocusWebView,
  SelectDirectoryAndAppendFolder,
} from "@src/types/system";
import type { ShopMountParams } from "@src/types/window-arranger";

import type { PreloadAPI } from "./types";

const api: PreloadAPI = {
  selectFolder: (params: SelectDirectoryAndAppendFolder) =>
    ipcRenderer.invoke(FROM_RENDERER_DIALOG_SELECT_DIR, params),
  store_getAllGameIds: () => ipcRenderer.invoke(FROM_RENDERER_STORE_GET_ALL_GAME_IDS),
  store_getGameInfo: (clientId: GameClientId) =>
    ipcRenderer.invoke(FROM_RENDERER_STORE_GET_GAME_INFO, { clientId }),
  store_clearGameInfo: (clientId: GameClientId) =>
    ipcRenderer.invoke(FROM_RENDERER_STORE_CLEAR_GAME_INFO, { clientId }),
  store_getDefaultGameDir: (params: SelectDirectoryAndAppendFolder) =>
    ipcRenderer.invoke(FROM_RENDERER_GET_DEFAULT_GAME_DIR, params),
  store_setDefaultGameDir: (dir: string) =>
    ipcRenderer.invoke(FROM_RENDERER_SET_DEFAULT_GAME_DIR, dir),
  store_getGuestId: () => ipcRenderer.invoke(FROM_RENDERER_GET_GUEST_ID),
  store_getUserSession: () => ipcRenderer.invoke(FROM_RENDERER_GET_USER_SESSION),
  store_getCloseSetting: () => ipcRenderer.invoke(FROM_RENDERER_GET_CLOSE_SETTING),
  store_setCloseSetting: (setting: CloseWindowSetting) =>
    ipcRenderer.invoke(FROM_RENDERER_SET_CLOSE_SETTING, setting),
  store_getNotificationPermission: () =>
    ipcRenderer.invoke(FROM_RENDERER_GET_NOTIFICATION_PERMISSION),
  store_setNotificationPermission: (permission: NotificationPermission) =>
    ipcRenderer.invoke(FROM_RENDERER_SET_NOTIFICATION_PERMISSION, permission),
  registerDeepLink: (params: DeepLinkRegisterParams) =>
    ipcRenderer.invoke(FROM_RENDERER_DEEPLINK_REGISTER, params),
  renderLoginPage: (params: LoginStateInfo) =>
    ipcRenderer.invoke(FROM_RENDERER_LOGIN_PAGE_MOUNT, params),
  download_getAllDownloads: () => ipcRenderer.invoke(FROM_RENDERER_GAME_DOWNLOAD_GET_ALL_DOWNLOADS),
  download_getDownloadProgress: (params: CommonEventParams) =>
    ipcRenderer.invoke(FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS, params),
  download_start: (params: DownloadInitInfo) =>
    ipcRenderer.send(FROM_RENDERER_GAME_DOWNLOAD_START, params),
  download_cancel: (params: DownloadItemInteractionParams) =>
    ipcRenderer.send(FROM_RENDERER_GAME_DOWNLOAD_CANCEL, params),
  download_resume: (params: DownloadItemInteractionParams) =>
    ipcRenderer.send(FROM_RENDERER_GAME_DOWNLOAD_RESUME, params),
  download_pause: (params: DownloadItemInteractionParams) =>
    ipcRenderer.send(FROM_RENDERER_GAME_DOWNLOAD_PAUSE, params),
  download_retry: (params: DownloadItemInteractionParams) =>
    ipcRenderer.send(FROM_RENDERER_GAME_DOWNLOAD_RETRY, params),
  install_removeWhenSuccess: (clientId: GameClientId) =>
    ipcRenderer.send(FROM_RENDERER_GAME_DOWNLOAD_REMOVE_WHEN_INSTALL_SUCCESS, { clientId }),
  app_getVersion: () => ipcRenderer.invoke(FROM_RENDERER_APP_GET_VERSION),
  app_checkForAvailableStorage: (dir: string) =>
    ipcRenderer.invoke(FROM_RENDERER_CHECK_FOR_AVAILABLE_STORAGE, dir),
  app_checkForUpdate: () => ipcRenderer.send(FROM_RENDERER_APP_CHECK_FOR_UPDATE),
  app_triggerUpdate: () => ipcRenderer.send(FROM_RENDERER_APP_TRIGGER_INSTALL_UPDATE),
  game_getGameSessionStatus: (clientId: GameClientId) =>
    ipcRenderer.invoke(FROM_RENDERER_GET_GAME_SESSION_STATUS, { clientId }),
  game_uninstallGame: (params: UninstallGameParams) =>
    ipcRenderer.invoke(FROM_RENDERER_UNINSTALL_GAME, params),
  game_playNativeGame: (params: PlayNativeGameParams) =>
    ipcRenderer.invoke(FROM_RENDERER_START_NATIVE_GAME, params),
  game_createShortcut: (params: DetailsPageGameInfo) =>
    ipcRenderer.send(FROM_RENDERER_CREATE_DESKTOP_SHORTCUT, params),
  minigames_getList: () => ipcRenderer.invoke(FROM_RENDERER_GET_MINIGAMES),
  analytics_getInfoForAnalytics: () => ipcRenderer.invoke(FROM_RENDERER_GET_INFO_FOR_ANALYTICS),
  webViewFocus: (params: FocusWebView) => ipcRenderer.invoke(FROM_RENDERER_FOCUS_WEBVIEW, params),
  getOpenAtLoginSetting: () => ipcRenderer.invoke(FROM_RENDERER_GET_OPEN_AT_LOGIN_SETTING),
  setOpenAtLoginSetting: (openAtLogin: boolean) =>
    ipcRenderer.send(FROM_RENDERER_SET_OPEN_AT_LOGIN_SETTING, openAtLogin),
  sendNotification: (notificationPayload: NotificationPayload) =>
    ipcRenderer.send(FROM_RENDERER_SEND_NOTIFICATION, notificationPayload),
  sendLog: (message: string) => ipcRenderer.send(FROM_RENDERER_SEND_LOG, message),
  locateGame: (remoteGameDetails: DetailsPageGameInfo) =>
    ipcRenderer.invoke(FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES, remoteGameDetails),

  shop_goBack: () => ipcRenderer.invoke(FROM_RENDERER_PAGE_SHOP_BACK),
  shop_goForward: () => ipcRenderer.invoke(FROM_RENDERER_PAGE_SHOP_FORWARD),
  shop_mount: (params: ShopMountParams) => ipcRenderer.send(FROM_RENDERER_PAGE_SHOP_MOUNT, params),
  shop_unmount: () => ipcRenderer.send(FROM_RENDERER_PAGE_SHOP_UNMOUNT),

  account_goBack: () => ipcRenderer.invoke(FROM_RENDERER_PAGE_ACCOUNT_BACK),
  account_goForward: () => ipcRenderer.invoke(FROM_RENDERER_PAGE_ACCOUNT_FORWARD),

  redeem_getUserHasRedeemedCode: ({ clientId }: CommonEventParams) =>
    ipcRenderer.invoke(FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE, { clientId }),
  redeem_redeemCode: (params: SetRedeemCodeInfo) =>
    ipcRenderer.invoke(FROM_RENDERER_REDEEM_CODE, params),
  redeem_userPlayGameToRedeem: (params: CommonEventParams) =>
    ipcRenderer.invoke(FROM_RENDERER_USER_PLAY_GAME_TO_REDEEM, params),

  system_forwardResultToNode: (params: ResultFromRendererToNode<unknown>) =>
    ipcRenderer.invoke(FROM_RENDERER_RETURN_REQUEST_RESULT, params),

  app_openExternalWeb: (url: string) => ipcRenderer.send(FROM_RENDERER_OPEN_EXTERNAL_WEB, url),
  app_extractZip: (path: string) => ipcRenderer.send(FROM_RENDERER_EXTRACT_ZIP, path),

  app_addListener: (event, lístener) => electronAPI.ipcRenderer.on(event, lístener),

  survey_submitQuestionAnswer: () => ipcRenderer.send(FROM_RENDERER_SUBMIT_SURVEY_QUESTION_ANSWER),

  app_close: () => ipcRenderer.send(FROM_RENDERER_APP_CLOSE),
  app_minimize: () => ipcRenderer.send(FROM_RENDERER_APP_MINIMIZE),
  app_minimizeToTray: () => ipcRenderer.send(FROM_RENDERER_APP_MINIMIZE_TO_TRAY),
  app_attemptToClose: () => ipcRenderer.send(FROM_RENDERER_APP_ATTEMPT_TO_CLOSE),
  app_reconnectToNetwork: () => ipcRenderer.send(FROM_RENDERER_RECONNECT_TO_NETWORK),

  user_logout: () => ipcRenderer.send(FROM_RENDERER_USER_LOGOUT),

  webGame_mount: (params: ShowEmbeddedGameArgs) =>
    ipcRenderer.send(FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_MOUNT, params),
  webGame_unmount: () => ipcRenderer.send(FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_UNMOUNT),

  minigame_play: (minigameId: string) => ipcRenderer.send(FROM_RENDERER_PLAY_MINIGAME, minigameId),

  account_mount: () => ipcRenderer.send(FROM_RENDERER_PAGE_ACCOUNT_MOUNT),
  account_unmount: () => ipcRenderer.send(FROM_RENDERER_PAGE_ACCOUNT_UNMOUNT),
} as const;

const minigamesApi = {
  logoutCallback: () => {
    console.log("Logged out");
  },
} as const;

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.

if (process.contextIsolated) {
  try {
    if (window.location.href.includes(envNode.minigames)) {
      contextBridge.exposeInMainWorld("launcherApi", minigamesApi);
    } else {
      contextBridge.exposeInMainWorld("electron", electronAPI);
      contextBridge.exposeInMainWorld("api", api);
    }
  } catch (error) {
    console.error(error);
  }
} else {
  if (window.location.href.includes(envNode.minigames)) {
    // @ts-ignore (define in dts)
    window.launcherApi = minigamesApi;
  } else {
    // @ts-ignore (define in dts)
    window.api = api;
  }
}
