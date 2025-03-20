import * as Sentry from "@sentry/electron/main";

import { ignoreListErrors } from "@src/logger/common";

import { envNode } from "./env-node";

export const initMonitoringMain = (): void => {
  if (envNode.environment === "test") return;

  Sentry.init({
    dsn: envNode.sentryDsn,

    environment: envNode.environment,
    ignoreErrors: ignoreListErrors(),
  });
};
