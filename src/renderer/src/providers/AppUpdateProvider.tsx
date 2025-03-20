import type { IpcRendererListener } from "@electron-toolkit/preload";
import type { AuthInfo } from "electron";
import { type ProgressInfo, type UpdateDownloadedEvent, type UpdateInfo } from "electron-updater";
import type { AppUpdaterEvents } from "electron-updater/out/AppUpdater";
import React, { useEffect, useMemo, type PropsWithChildren } from "react";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";

import { FROM_NODE_APP_UPDATE_EVENT } from "@src/const/events";

type AppUpdateInfo =
  | {
      currentUpdateEvent: "checking-for-update";
    }
  | {
      currentUpdateEvent: "update-not-available";
      info: UpdateInfo;
    }
  | {
      currentUpdateEvent: "update-available";
      info: UpdateInfo;
    }
  | {
      currentUpdateEvent: "update-downloaded";
      info: UpdateDownloadedEvent;
    }
  | {
      currentUpdateEvent: "download-progress";
      info: ProgressInfo;
    }
  | {
      currentUpdateEvent: "update-cancelled";
      info: UpdateInfo;
    }
  | {
      currentUpdateEvent: "appimage-filename-updated";
      info: string;
    }
  | { currentUpdateEvent: "error"; info: Error };
interface AppUpdateType {
  appUpdateInfo: AppUpdateInfo | undefined;
  version?: string;
}

const AppUpdateContext = React.createContext<AppUpdateType>(null as unknown as AppUpdateType);

export const AppUpdateProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [appUpdateInfo, setAppUpdateInfo] = React.useState<AppUpdateInfo>();
  const [version, setVersion] = React.useState<string>();

  const contextValue: AppUpdateType = React.useMemo(
    () => ({ appUpdateInfo, version }),
    [appUpdateInfo, version],
  );
  const handlers: AppUpdaterEvents = useMemo(
    () => ({
      error: (error: Error): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "error",
          info: error,
        });
      },
      "checking-for-update": (): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "checking-for-update",
        });
      },
      "update-not-available": (info: UpdateInfo): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "update-not-available",
          info,
        });
      },
      "update-available": (info: UpdateInfo): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "update-available",
          info,
        });
      },
      "update-downloaded": (event: UpdateDownloadedEvent): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "update-downloaded",
          info: event,
        });
      },
      "download-progress": (info: ProgressInfo): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "download-progress",
          info,
        });
      },
      "update-cancelled": (info: UpdateInfo): void => {
        setAppUpdateInfo({
          currentUpdateEvent: "update-cancelled",
          info,
        });
      },
      login: (): void => {},

      "appimage-filename-updated": (): void => {},
    }),
    [],
  );

  const isUnmounted = useIsUnmountedRef();
  useEffect(() => {
    isUnmounted.current = false;

    void window.api.app_getVersion().then((version) => {
      setVersion(version);
    });
  }, [isUnmounted]);

  useEffect(() => {
    const listener: IpcRendererListener = (_, { event, details }) => {
      if (event === "error") {
        handlers.error(details as Error);
      } else if (event === "login") {
        handlers.login(details as AuthInfo, () => {});
      } else {
        console.log("app update event", event, details);
        handlers[event](details);
      }
    };
    return window.api.app_addListener(FROM_NODE_APP_UPDATE_EVENT, listener);
  }, [handlers]);

  return <AppUpdateContext.Provider value={contextValue}>{children}</AppUpdateContext.Provider>;
};

export const useAppUpdateProvider = (): AppUpdateType => {
  const contextValue = React.useContext(AppUpdateContext);

  return contextValue;
};
