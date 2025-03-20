export const SERVICE_ID = "nexus";
export const LAUNCHER_DEEP_LINK = `vga-${SERVICE_ID}`;
export const LOGIN_OAUTH_URI = `${LAUNCHER_DEEP_LINK}://`;
export const GAME_SESSION_OAUTH_URI_DEEP_LINK = `${LAUNCHER_DEEP_LINK}://game-session`;

export const SEARCH_PARAM_GAME_TRIGGER_URI = "gameId";
export const GAME_TRIGGER_URI = `${LAUNCHER_DEEP_LINK}://launch-game`;

export const CODE_CHALLENGE_METHOD = "S256";

export const ALLOW_ALL_METHODS = "";
export const DEFAULT_VGA_SCOPES = ""; // BE will get the default scopes on BE side

export const SESSION_CHECK_INTERVAL = 60 * 30;
