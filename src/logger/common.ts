import { LOG_LEVEL, type StdPluginLogParams } from "./loggerPackage";
import type { GlobalExtras } from "./types";

export const getLogLevel = (
  mode: "test" | "stg" | "production",
): (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL] => {
  switch (mode) {
    case "test":
      return LOG_LEVEL.debug;
    case "stg":
      return LOG_LEVEL.log;
    case "production":
      return LOG_LEVEL.log;
    default:
      return LOG_LEVEL.debug;
  }
};

export const createFileLoggerMessage = ({
  exception,
  loglevel,
  params,
  appVersion,
  globalExtras,
}: StdPluginLogParams<GlobalExtras>): string => {
  let exceptionObj;
  if (exception instanceof Error) {
    exceptionObj = {
      name: exception.name,
      msg: exception.message,
    };
  }
  const callSrc = globalExtras.Origin.includes("Node") ? "Node" : "Renderer";
  const fieldName = `${appVersion}-${new Date().toLocaleTimeString(undefined, { hour12: false })}-${callSrc}-${loglevel}`;
  const logMessage = {
    [fieldName]: {
      content: params,
      ...(exceptionObj ? { error: exceptionObj } : {}),
    },
  };
  return JSON.stringify(logMessage);
};

export const ignoreListErrors = (): Array<string | RegExp> => [
  "Connection failed",
  /ERR_INTERNET_DISCONNECTED/,
  /ERR_NETWORK_CHANGED/,
  /ERR_ABORTED \(-3\)/,
];
