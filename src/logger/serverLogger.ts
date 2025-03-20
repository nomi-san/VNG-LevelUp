import { is } from "@electron-toolkit/utils";
import { app } from "electron";

import { envNode } from "../main/env-node";
import { getLogLevel } from "./common";
import { loggerFileNodePlugin } from "./loggerFileNodePlugin";
import { sentryNodePlugin } from "./loggerNodePlugins";
import { createLogger } from "./loggerPackage";
import type { GlobalExtras, LoggerUserInfo } from "./types";

const plugins = is.dev ? [loggerFileNodePlugin] : [sentryNodePlugin, loggerFileNodePlugin];
const nodeLogger = createLogger<LoggerUserInfo, GlobalExtras>({
  appVersion: app.getVersion(),
  stdOut: console,
  logLevel: getLogLevel(envNode.environment),
  plugins,
  globalExtras: {
    Origin: "Level Up - Node Process",
  },
});

export default nodeLogger;
