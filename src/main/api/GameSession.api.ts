import type { WebContentsView } from "electron";

import type {
  GameSessionRequestParams,
  GameSessionResponse,
} from "@src/main/api/GameSession.types";
import {
  CODE_CHALLENGE_METHOD,
  DEFAULT_VGA_SCOPES,
  GAME_SESSION_OAUTH_URI_DEEP_LINK,
} from "@src/main/const/auth";
import { envNode } from "@src/main/env-node";
import { forwardRequestToRenderer } from "@src/main/request-on-renderer";

export function callPostGetGameSession(
  appContentView: WebContentsView,
  { codeChallenge, gameClientId, userSession, state }: GameSessionRequestParams,
): Promise<GameSessionResponse> {
  const getGameSessionPath = "/api/oauth/v1/authorize";

  const body = {
    productId: gameClientId,
    redirectUri: GAME_SESSION_OAUTH_URI_DEEP_LINK,
    codeChallenge,
    codeChallengeMethod: CODE_CHALLENGE_METHOD,
    state,
    scope: DEFAULT_VGA_SCOPES,
    responseType: "code",
  } as const;

  return forwardRequestToRenderer({
    appContentView,
    request: {
      url: `https://${envNode.launcher}${getGameSessionPath}`,
      method: "POST",
      body,
      params: {
        session: userSession,
      },
      apiName: "node_getGameSession",
    },
  });
}
