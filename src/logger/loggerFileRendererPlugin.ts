import { createFileLoggerMessage } from "./common";
import type { LoggerPlugin, StdPluginLogFunction } from "./loggerPackage";
import type { GlobalExtras, LoggerUserInfo } from "./types";

const logFunction: StdPluginLogFunction<GlobalExtras> = (param) => {
  const msg = createFileLoggerMessage(param);
  window.api.sendLog(msg);
};
export const loggerFileRendererPlugin: LoggerPlugin<LoggerUserInfo, GlobalExtras> = {
  debug: logFunction,
  log: logFunction,
  warn: logFunction,
  error: logFunction,
};
