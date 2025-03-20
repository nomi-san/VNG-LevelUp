import React, { useEffect, useLayoutEffect, useState, type PropsWithChildren } from "react";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";

import { getLogLevel } from "@src/logger/common";
import { loggerFileRendererPlugin } from "@src/logger/loggerFileRendererPlugin";
import { createLogger, LOG_LEVEL } from "@src/logger/loggerPackage";
import { sentryRendererPlugin } from "@src/logger/loggerRendererPlugins";
import type { GlobalExtras, LoggerUserInfo } from "@src/logger/types";

import { useSessionProvider } from "./SessionProvider";

type Logger = ReturnType<typeof createLogger<LoggerUserInfo, GlobalExtras>>;
const LoggerContext = React.createContext<Logger>(null as unknown as Logger);

export const ClientLoggerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [clientLogger] = useState<Logger>(
    createLogger<LoggerUserInfo, GlobalExtras>({
      appVersion: "init",
      stdOut: window.console,
      logLevel: LOG_LEVEL.error,
      plugins: [sentryRendererPlugin, loggerFileRendererPlugin],
      globalExtras: {
        Origin: "Level Up - Renderer Process",
      },
    }),
  );

  const isUnmounted = useIsUnmountedRef();

  useLayoutEffect(() => {
    if (isUnmounted.current) return;

    void window.api.analytics_getInfoForAnalytics().then((info) => {
      clientLogger.setAppVersion(info.appVersion);
      clientLogger.setLogLevel(getLogLevel(info.environment));
    });
  }, [clientLogger, isUnmounted]);

  const { vgaUser, guestId, launcherUser } = useSessionProvider();
  useEffect(() => {
    if (!clientLogger) return;
    if (!guestId) clientLogger.setUser(null);

    clientLogger.setUser({
      guestId,
      ggId: vgaUser?.ggId,
      launcherUserId: launcherUser?.userId,
    });
  }, [guestId, clientLogger, vgaUser?.ggId, launcherUser?.userId]);

  return <LoggerContext.Provider value={clientLogger}>{children}</LoggerContext.Provider>;
};

export const useClientLogger = () => {
  const logger = React.useContext(LoggerContext);

  return logger;
};
