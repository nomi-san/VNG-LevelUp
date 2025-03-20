import type { DetailsPageGameInfo, GameClientId, ProductAuthType } from "./game";

export type PlayNativeGameParams = {
  authType: ProductAuthType;
  payload: { gameClientId: string; metadata: DetailsPageGameInfo["metadata"] };
};

export type PlayGameStateInfo = {
  name: "RESOLVE_GAME_OAUTH_CODE";
  sessionId: GameSessionId;
  gameClientId: GameClientId;
};

export type PlayNativeGameResponse = "success" | "failed";

export type GameSessionStatus =
  | "fetching-session"
  | "running"
  | "terminated"
  | "awaiting-pii-submission";

export interface UninstallGameParams {
  gameClientId: GameClientId;
  title: string;
}

export type GameSessionId = string;

export type GameCode = string;

export type OnStartStopGameParams = {
  clientId: GameClientId;
  sessionId: GameSessionId;
};
