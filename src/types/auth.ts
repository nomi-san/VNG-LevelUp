import type { SupportedLanguage } from "@src/const/language";

import type { GameClientId } from "./game";
import type { LauncherUser, VgaUser } from "./user";

export interface BuildLoginInfo {
  serviceId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  state: string;

  authMethod?: string;
  lang: SupportedLanguage;

  codeVerifier?: string;
  extendedStateInfo?: LoginStateInfo;
}

export type AccessWebshopAction = {
  name: "ACCESS_WEBSHOP";
  payload: {
    redirectUrl: string;
    gameClientId: GameClientId;
  };
};

type DownloadGameAction = {
  name: "DOWNLOAD_GAME";
  payload: {
    gameClientId: GameClientId;
  };
};

export type PlayNativeGameAction = {
  name: "PLAY_NATIVE_GAME";
  payload: {
    gameClientId: GameClientId;
  };
};

export type PlayWebGameAction = {
  name: "PLAY_WEB_GAME";
  payload: {
    gameClientId: GameClientId;
  };
};

export type NormalLogin = {
  name: "NORMAL_LOGIN";
  payload: object;
};

export type LoginStateTriggerForceLogin =
  | AccessWebshopAction
  | PlayNativeGameAction
  | PlayWebGameAction;

export type LoginStateInfo =
  | AccessWebshopAction
  | DownloadGameAction
  | PlayNativeGameAction
  | PlayWebGameAction
  | NormalLogin;

export interface UpdateUserSessionParams {
  session: string;
  vgaUser: VgaUser;
  state?: LoginStateInfo;
  launcherUser: LauncherUser | null;
}

export type TriggerState =
  | "AutoOpenDownloadDialog"
  | "AutoStartNativeGameOnOpenShortcut"
  | "AutoStartNativeGameAfterLogin";

export type ForceLoginResult = "can-not-continue" | "can-continue";
