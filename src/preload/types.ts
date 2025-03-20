import type { electronAPI } from "@electron-toolkit/preload";

import type { ShowEmbeddedGameArgs } from "@src/const/events";
import type { InfoForAnalytics } from "@src/types/analytics";
import type {
  CloseWindowSetting,
  NotificationPayload,
  NotificationPermission,
} from "@src/types/app-settings";
import type { LoginStateInfo } from "@src/types/auth";
import type { CommonEventParams } from "@src/types/common";
import type { DetailsPageGameInfo, GameClientId, LocalGameInfoV3 } from "@src/types/game";
import type { Minigame } from "@src/types/minigames";
import type {
  GameSessionStatus,
  PlayNativeGameParams,
  UninstallGameParams,
} from "@src/types/native-game";
import type { LocalRedeemCodeInfo, SetRedeemCodeInfo } from "@src/types/redeem";
import type { ResultFromRendererToNode } from "@src/types/request";
import type {
  DeepLinkRegisterParams,
  DirectoryInfo,
  DownloadInitInfo,
  DownloadItemInteractionParams,
  DownloadProgressInfo,
  FocusWebView,
  SelectDirectoryAndAppendFolder,
  UserSessionInfo,
} from "@src/types/system";
import type { ShopMountParams } from "@src/types/window-arranger";

export interface PreloadAPI {
  selectFolder: (params: SelectDirectoryAndAppendFolder) => Promise<DirectoryInfo | undefined>;
  store_getAllGameIds: () => Promise<GameClientId[]>;
  store_getGameInfo: (clientId: GameClientId) => Promise<LocalGameInfoV3 | null>;
  store_clearGameInfo: (clientId: GameClientId) => Promise<void>;
  store_getDefaultGameDir: (
    params: SelectDirectoryAndAppendFolder,
  ) => Promise<DirectoryInfo | undefined>;
  store_setDefaultGameDir: (dir: string) => Promise<string>;
  store_getGuestId: () => Promise<string>;
  store_getUserSession: () => Promise<UserSessionInfo>;
  store_getCloseSetting: () => Promise<CloseWindowSetting>;
  store_setCloseSetting: (setting: CloseWindowSetting) => Promise<void>;
  store_getNotificationPermission: () => Promise<NotificationPermission>;
  store_setNotificationPermission: (permission: NotificationPermission) => Promise<void>;
  registerDeepLink: (params: DeepLinkRegisterParams) => Promise<void>;
  renderLoginPage: (params: LoginStateInfo) => Promise<void>;
  download_getAllDownloads: () => Promise<DownloadProgressInfo[]>;
  download_getDownloadProgress: (
    params: CommonEventParams,
  ) => Promise<DownloadProgressInfo | "NOT_FOUND">;
  download_start: (params: DownloadInitInfo) => void;
  download_cancel: (params: DownloadItemInteractionParams) => void;
  download_resume: (params: DownloadItemInteractionParams) => void;
  download_pause: (params: DownloadItemInteractionParams) => void;
  download_retry: (params: DownloadItemInteractionParams) => void;
  install_removeWhenSuccess: (params: GameClientId) => void;
  app_getVersion: () => Promise<string>;
  app_checkForAvailableStorage: (dir: string) => Promise<DirectoryInfo>;
  app_checkForUpdate: () => void;
  app_triggerUpdate: () => void;
  game_getGameSessionStatus: (clientId: GameClientId) => Promise<GameSessionStatus>;
  game_uninstallGame: (params: UninstallGameParams) => Promise<boolean>;
  game_playNativeGame: (params: PlayNativeGameParams) => Promise<void>;
  game_createShortcut: (params: DetailsPageGameInfo) => void;
  minigames_getList: () => Promise<Minigame[]>;
  analytics_getInfoForAnalytics: () => Promise<InfoForAnalytics>;
  webViewFocus: (params: FocusWebView) => Promise<void>;
  getOpenAtLoginSetting: () => Promise<boolean>;
  setOpenAtLoginSetting: (openAtLogin: boolean) => void;
  sendNotification: (notificationPayload: NotificationPayload) => void;
  sendLog: (message: string) => void;
  locateGame: (gameName: DetailsPageGameInfo) => Promise<string>;

  shop_goBack: () => Promise<"should-unmount" | undefined>;
  shop_goForward: () => Promise<"should-unmount" | undefined>;
  shop_mount: (params: ShopMountParams) => void;
  shop_unmount: () => void;

  account_goBack: () => Promise<"should-unmount" | undefined>;
  account_goForward: () => Promise<"should-unmount" | undefined>;

  redeem_getUserHasRedeemedCode: (params: CommonEventParams) => Promise<LocalRedeemCodeInfo>;
  redeem_redeemCode: (params: SetRedeemCodeInfo) => Promise<void>;
  redeem_userPlayGameToRedeem: (params: CommonEventParams) => Promise<void>;

  system_forwardResultToNode: (params: ResultFromRendererToNode<unknown>) => void;

  app_openExternalWeb: (url: string) => void;
  app_extractZip: (path: string) => void;
  app_addListener: typeof electronAPI.ipcRenderer.on;

  survey_submitQuestionAnswer: () => void;

  app_close: () => void;
  app_minimize: () => void;
  app_minimizeToTray: () => void;
  app_attemptToClose: () => void;
  app_reconnectToNetwork: () => void;

  user_logout: () => void;

  webGame_mount: (params: ShowEmbeddedGameArgs) => void;
  webGame_unmount: () => void;

  minigame_play: (minigameId: string) => void;

  account_mount: () => void;
  account_unmount: () => void;
}
