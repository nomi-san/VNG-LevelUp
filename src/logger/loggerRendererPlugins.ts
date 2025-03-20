import * as Sentry from "@sentry/electron/renderer";

import type { LoggerPlugin, StdPluginLogFunction } from "./loggerPackage";
import type { GlobalExtras, LoggerUserInfo } from "./types";

const logFunction: StdPluginLogFunction<GlobalExtras> = ({ exception, loglevel, params }) => {
  Sentry.withScope((scope) => {
    scope.setLevel(loglevel);
    if (exception) Sentry.captureException(exception);
    else Sentry.captureMessage(JSON.stringify(params));
  });
};
export const sentryRendererPlugin: LoggerPlugin<LoggerUserInfo, GlobalExtras> = {
  warn: logFunction,
  error: logFunction,
  setUser: (user) => {
    Sentry.setUser(user);
  },
  setGlobalExtras: (extras) => {
    if (extras) Sentry.getGlobalScope().setExtras(extras);
  },
  setTags: (tags) => {
    Sentry.setTags(tags);
  },
};
