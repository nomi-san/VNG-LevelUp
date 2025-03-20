import { writeLog } from "@src/main/file-logger";

import { createFileLoggerMessage } from "./common";
import type { LoggerPlugin, StdPluginLogFunction } from "./loggerPackage";
import type { GlobalExtras, LoggerUserInfo } from "./types";

const logFunction: StdPluginLogFunction<GlobalExtras> = (params) => {
  const msg = createFileLoggerMessage(params);
  writeLog(msg);
};
export const loggerFileNodePlugin: LoggerPlugin<LoggerUserInfo, GlobalExtras> = {
  debug: logFunction,
  log: logFunction,
  warn: logFunction,
  error: logFunction,
};
