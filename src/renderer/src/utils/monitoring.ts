import * as Sentry from "@sentry/electron/renderer";

import { envRender } from "@renderer/env-render";

import { ignoreListErrors } from "@src/logger/common";

export const initMonitoringRenderer = (): void => {
  if (envRender.environment === "test") return;

  Sentry.init({
    dsn: envRender.sentryDsn,

    environment: envRender.environment,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],

    tracesSampleRate: 1.0,

    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: ignoreListErrors(),
  });
};
