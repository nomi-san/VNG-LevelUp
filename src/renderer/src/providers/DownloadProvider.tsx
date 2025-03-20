import React, { useCallback, useEffect, useLayoutEffect, type PropsWithChildren } from "react";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";

import {
  FROM_NODE_DOWNLOAD_UPDATE_STATUS,
  FROM_NODE_UPDATE_DOWNLOAD_LIST,
} from "@src/const/events";
import type { GameClientId } from "@src/types/game";
import type { DownloadInitInfo, DownloadProgressInfo } from "@src/types/system";

interface DownloadQueueContextType {
  downloadsList: DownloadInitInfo[];
  appendDownload: (download: DownloadInitInfo) => void;
}
const DownloadQueueContext = React.createContext<DownloadQueueContextType>(
  null as unknown as DownloadQueueContextType,
);

export const DownloadQueueProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [downloadsList, setDownloadsList] = React.useState<DownloadInitInfo[]>([]);

  const appendDownload = useCallback((download: DownloadInitInfo) => {
    window.api.download_start(download);
  }, []);

  const contextValue = React.useMemo(() => {
    return {
      downloadsList,
      appendDownload,
    };
  }, [downloadsList, appendDownload]);

  const isUnmounted = useIsUnmountedRef();
  const updateDownloadList = useCallback(() => {
    if (isUnmounted.current) return;

    void window.api.download_getAllDownloads().then((downloads) => {
      console.log("update download list", downloads);
    });
  }, [isUnmounted]);
  useLayoutEffect(() => {
    // When react hot reload happens, the download list is lost
    // We have to call this so that the download list is updated
    updateDownloadList();

    return window.api.app_addListener(
      FROM_NODE_UPDATE_DOWNLOAD_LIST,
      (_, downloads: DownloadProgressInfo[]) => {
        setDownloadsList(downloads.map((d) => d.initInfo));
      },
    );
  }, [updateDownloadList]);

  return (
    <DownloadQueueContext.Provider value={contextValue}>{children}</DownloadQueueContext.Provider>
  );
};

export const useDownloadQueueProvider = (): DownloadQueueContextType => {
  const contextValue = React.useContext(DownloadQueueContext);

  return contextValue;
};

///////////////////////////////////////

interface DownloadProgressContextType {
  addSubscriber: (
    clientId: GameClientId,
    subscriber: (progressInfo: DownloadProgressInfo) => void,
  ) => () => void;
}
export const DownloadProgressContext = React.createContext<DownloadProgressContextType>({
  addSubscriber: () => (): void => {},
});
const subscribersDefaultValue: Record<
  GameClientId,
  Record<string, (progressInfo: DownloadProgressInfo) => void>
> = {};
export const DownloadProgressProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const subscribers =
    React.useRef<
      Record<GameClientId, Record<string, (progressInfo: DownloadProgressInfo) => void>>
    >(subscribersDefaultValue);

  const addSubscriber = useCallback(
    (clientId: GameClientId, subscriber: (progressInfo: DownloadProgressInfo) => void) => {
      if (!subscribers.current[clientId]) {
        subscribers.current[clientId] = {};
      }
      const uniqueKey = Math.random().toString();

      subscribers.current[clientId][uniqueKey] = subscriber;

      return () => {
        delete subscribers.current[clientId][uniqueKey];
      };
    },
    [],
  );

  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_DOWNLOAD_UPDATE_STATUS,
      (_, progressInfo: DownloadProgressInfo) => {
        const { gameClientId } = progressInfo.initInfo;
        const clientIdSubscribers = subscribers.current[gameClientId];
        if (!clientIdSubscribers) return;

        Object.values(clientIdSubscribers).forEach((subscriber) => {
          subscriber(progressInfo);
        });
      },
    );
  }, []);

  const contextValue = React.useMemo(() => {
    return {
      addSubscriber,
    };
  }, [addSubscriber]);

  return (
    <DownloadProgressContext.Provider value={contextValue}>
      {children}
    </DownloadProgressContext.Provider>
  );
};

export const useDownloadProgressProvider = (): DownloadProgressContextType => {
  return React.useContext(DownloadProgressContext);
};
