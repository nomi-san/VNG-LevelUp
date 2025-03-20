import type { VgaUser } from "@src/types/user";

export const FROM_RENDERER_RETURN_REQUEST_RESULT = "app:returnRequestResult";
export const FROM_NODE_MAKE_REQUEST = "app:makeRequest";

export const FROM_RENDERER_APP_ATTEMPT_TO_CLOSE = "app:attemptToClose";
export const FROM_RENDERER_APP_CLOSE = "app:close";
export const FROM_NODE_WARN_USER_TO_CHECK_DOWNLOADS_WHEN_CLOSING_APP =
  "app:warnUserToCheckDownloadsWhenClosingApp";
export const FROM_RENDERER_APP_MINIMIZE = "app:minimize";
export const FROM_RENDERER_APP_MINIMIZE_TO_TRAY = "app:minimizeToTray";
export const FROM_RENDERER_APP_GET_VERSION = "app:getVersion";
export const FROM_RENDERER_CHECK_FOR_AVAILABLE_STORAGE = "app:checkForAvailableStorage";

export const FROM_RENDERER_DIALOG_SELECT_DIR = "dialog:openDirectory";

export const FROM_NODE_UPDATE_USER_SESSION = "session:update";
export const FROM_NODE_UPDATE_IS_VALIDATING_SESSION = "session:isValidating";

export const FROM_RENDERER_LOGIN_PAGE_MOUNT = "mountPage:USER_LOGIN";
export const FROM_RENDERER_USER_LOGOUT = "USER_LOGOUT";

export const FROM_RENDERER_PAGE_SHOP_MOUNT = "mountPage:SHOW_WEBSHOP";
export const FROM_RENDERER_PAGE_SHOP_UNMOUNT = "unmountPage:SHOW_WEBSHOP";
export const FROM_RENDERER_PAGE_SHOP_BACK = "unmountPage:WEBSHOP_NAVIGATION_BACK";
export const FROM_RENDERER_PAGE_SHOP_FORWARD = "unmountPage:WEBSHOP_NAVIGATION_FORWARD";
export const FROM_NODE_PAGE_SHOP_UPDATE_NAVIGATION = "shop:updateNavigation";

export const FROM_RENDERER_PAGE_ACCOUNT_MOUNT = "mountPage:SHOW_ACCOUNT";
export const FROM_RENDERER_PAGE_ACCOUNT_UNMOUNT = "unmountPage:SHOW_ACCOUNT";
export const FROM_RENDERER_PAGE_ACCOUNT_BACK = "unmountPage:ACCOUNT_NAVIGATION_BACK";
export const FROM_RENDERER_PAGE_ACCOUNT_FORWARD = "unmountPage:ACCOUNT_NAVIGATION_FORWARD";
export const FROM_NODE_PAGE_ACCOUNT_UPDATE_NAVIGATION = "account:updateNavigation";

export const FROM_RENDERER_GAME_DOWNLOAD_START = "download:start";
export const FROM_RENDERER_GAME_DOWNLOAD_CANCEL = "download:cancel";
export const FROM_RENDERER_GAME_DOWNLOAD_PAUSE = "download:pause";
export const FROM_RENDERER_GAME_DOWNLOAD_RESUME = "download:resume";
export const FROM_RENDERER_GAME_DOWNLOAD_RETRY = "download:retry";
export const FROM_RENDERER_GAME_DOWNLOAD_GET_INFO = "download:getInfo";
export const FROM_RENDERER_GAME_DOWNLOAD_GET_ALL_DOWNLOADS = "download:getDownloadList";
export const FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS = "download:getDownloadProgress";
export const FROM_RENDERER_GAME_DOWNLOAD_REMOVE_WHEN_INSTALL_SUCCESS = "download:removeWhenSuccess";

export const FROM_NODE_DOWNLOAD_UPDATE_STATUS = "download:updateStatus";
export const FROM_NODE_UPDATE_DOWNLOAD_LIST = "download:updateList";

export const FROM_RENDERER_STORE_GET_GAME_INFO = "store:getGameInfo";
export const FROM_RENDERER_STORE_GET_ALL_GAME_IDS = "store:getAllGameIds";
export const FROM_RENDERER_STORE_CLEAR_GAME_INFO = "store:clearGameInfo";
export const FROM_RENDERER_GET_DEFAULT_GAME_DIR = "store:getDefaultGameDir";
export const FROM_RENDERER_SET_DEFAULT_GAME_DIR = "store:setDefaultGameDir";
export const FROM_RENDERER_GET_CLOSE_SETTING = "store:getCloseSetting";
export const FROM_RENDERER_SET_CLOSE_SETTING = "store:setCloseSetting";
export const FROM_RENDERER_GET_NOTIFICATION_PERMISSION = "store:getNotificationPermission";
export const FROM_RENDERER_SET_NOTIFICATION_PERMISSION = "store:setNotificationPermission";
export const FROM_RENDERER_GET_GUEST_ID = "store:getGuestId";
export const FROM_RENDERER_GET_USER_SESSION = "store:getUserSession";

export const FROM_RENDERER_EXTRACT_ZIP = "EXTRACT_ZIP";

export const FROM_RENDERER_DEEPLINK_REGISTER = "DEEPLINK_REGISTER";

export const FROM_RENDERER_OPEN_EXTERNAL_WEB = "OPEN_EXTERNAL_WEB";

export interface ShowEmbeddedGameArgs {
  token: string;
  clientId: string;
  user: VgaUser | null;
  link: string;
}
export const FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_MOUNT = "mountPage:EMBEDDED_WEB_GAME";
export const FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_UNMOUNT = "unmountPage:EMBEDDED_WEB_GAME";

export const FROM_RENDERER_START_NATIVE_GAME = "nativeGame:start";
export const FROM_RENDERER_GET_GAME_SESSION_STATUS = "nativeGame:getGameSessionStatus";

export const FROM_NODE_ON_STOP_NATIVE_GAME = "nativeGame:onStop";
export const FROM_NODE_ON_AWAIT_FOR_PII_NATIVE_GAME = "nativeGame:onAwaitForPii";
export const FROM_NODE_ON_START_NATIVE_GAME = "nativeGame:onStart";

export const FROM_RENDERER_GET_MINIGAMES = "minigames:getList";
export const FROM_RENDERER_PLAY_MINIGAME = "minigame:play";

export const FROM_NODE_APP_UPDATE_EVENT = "app:update";
export const FROM_RENDERER_APP_TRIGGER_DOWNLOAD_UPDATE = "app:triggerDownloadUpdate";
export const FROM_RENDERER_APP_TRIGGER_INSTALL_UPDATE = "app:triggerInstallUpdate";
export const FROM_RENDERER_APP_CHECK_FOR_UPDATE = "app:checkForUpdate";

export const FROM_RENDERER_GET_INFO_FOR_ANALYTICS = "analytics:getInfo";

export const FROM_RENDERER_RECONNECT_TO_NETWORK = "RECONNECT_TO_NETWORK";

export const FROM_RENDERER_SET_OPEN_AT_LOGIN_SETTING = "RENDERER_SET_OPEN_AT_LOGIN_SETTING";
export const FROM_RENDERER_GET_OPEN_AT_LOGIN_SETTING = "RENDERER_GET_OPEN_AT_LOGIN_SETTING";
export const FROM_RENDERER_SEND_NOTIFICATION = "RENDERER_SEND_NOTIFICATION";
export const FROM_RENDERER_SEND_LOG = "RENDERER_SEND_LOG";
export const FROM_NODE_TRIGGER_SURVEY = "survey:trigger";
export const FROM_RENDERER_SUBMIT_SURVEY_QUESTION_ANSWER = "survey:question:submitAnswer";

export const FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG =
  "navigateToGameAndDownload";
export const FROM_NODE_SELECT_GAME_ON_LIST_AND_START_GAME_SHORTCUT =
  "navigateToGameAndPlay:shortcut";

export const FROM_RENDERER_UNINSTALL_GAME = "game:uninstall";

export const FROM_RENDERER_FOCUS_WEBVIEW = "webview:focus";

export const FROM_RENDERER_CREATE_DESKTOP_SHORTCUT = "shortcut:create";

export const FROM_NODE_FORCE_NAVIGATE_TO_HOME = "forceNavigateToHome";

export const FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES = "scanInstalledGames";

export const FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE = "redeem:getUserHasRedeemedCode";
export const FROM_RENDERER_REDEEM_CODE = "redeem:redeemCode";
export const FROM_RENDERER_USER_PLAY_GAME_TO_REDEEM = "redeem:userPlayGameToRedeem";

export const FROM_NODE_TRIGGER_PII_DECLARE = "pii:trigger";
export const FROM_NODE_PII_DECLARE_SUCCESSFULLY = "pii:success";
