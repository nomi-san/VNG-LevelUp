import path from "node:path";
import { app, type WebContentsView } from "electron";

import { BaseFetchError } from "@src/const/error";
import nodeLogger from "@src/logger/serverLogger";
import { callPostSession } from "@src/main/api/Profile.api";
import { GAME_SESSION_OAUTH_URI_DEEP_LINK, LAUNCHER_DEEP_LINK } from "@src/main/const/auth";
import { envNode } from "@src/main/env-node";
import { resolveCodeForGameAfterPII } from "@src/main/game";
import { decodeState } from "@src/main/utils/crypto";

import { getGlobalLoginInfo } from "./shared";
import launcherStore from "./store";
import { onStartVerifySession } from "./user-session";

if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(LAUNCHER_DEEP_LINK, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(LAUNCHER_DEEP_LINK);
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  if (!envNode.isInAutoTestEnvironment) app.quit();
} else {
  app.on("open-url", (_, url) => {
    if (url) {
      nodeLogger.debug("open-url", url);
    }

    if (process.platform == "darwin") {
      app.dock.bounce();
    }
  });

  void app.whenReady().then(() => {});
}

export const readDeepLinkFromSecondInstanceAndUpdateSession = async (
  appContentView: WebContentsView,
  argv: string[],
): Promise<void> => {
  try {
    const deepLinkUrl = argv.at(-1) || "";
    if (!deepLinkUrl.startsWith(LAUNCHER_DEEP_LINK)) return;

    const temp = new URL(deepLinkUrl);
    const code = temp.searchParams.get("code");
    const state = temp.searchParams.get("state");
    if (!code || !state) return;

    const userAction = deepLinkUrl.startsWith(GAME_SESSION_OAUTH_URI_DEEP_LINK)
      ? "game-session"
      : "login";

    if (userAction === "login") {
      const loginInfo = getGlobalLoginInfo();
      if (!loginInfo || !loginInfo.codeVerifier || loginInfo.state !== state) {
        // TODO: This is not a fetch error, make an App Error for this
        throw new BaseFetchError({
          code: "state_not_identical",
          message: "state not identical when logging in",
          statusCode: 400,
          requestId: "",
        });
      } else {
        nodeLogger.log("[PASSED] Pass state checking");
      }
      onStartVerifySession(appContentView);
      const { session } = await callPostSession(appContentView, code, loginInfo.codeVerifier);

      // When session is updated, the listener in user-session.ts will update the user info on renderer so we don't need to do it here
      launcherStore.setUserSession(session);
    }

    if (userAction === "game-session") {
      const info = decodeState(state);
      if (!info) return;
      if (info.name === "RESOLVE_GAME_OAUTH_CODE") {
        const { sessionId, gameClientId } = info;

        const result = resolveCodeForGameAfterPII({
          gameClientId,
          sessionId,
          code,
          state,
        });

        if (!result) {
          throw new BaseFetchError({
            code: "state_not_identical",
            message: "state not identical or game session is missing or timed out",
            statusCode: 400,
            requestId: "",
          });
        }
      }
    }
  } catch (error) {
    nodeLogger.error(error, "[DEEP LINK ERROR]");
  }
};
