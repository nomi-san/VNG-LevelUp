import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect } from "react";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import {
  useDownloadProgressProvider,
  useDownloadQueueProvider,
} from "@renderer/providers/DownloadProvider";
import { isInstallSuccess } from "@renderer/utils/download";

import { FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS } from "@src/const/events";
import type { GameClientId } from "@src/types/game";
import type { DownloadProgressInfo } from "@src/types/system";

export const downloadProgressQueryOptions = (gameClientId: GameClientId) =>
  queryOptions({
    queryKey: [FROM_RENDERER_GAME_DOWNLOAD_GET_DOWNLOAD_PROGRESS, { gameClientId }],
    queryFn: () => window.api.download_getDownloadProgress({ clientId: gameClientId }),
  });

const useInvalidateDownloadSubscriberQuery = () => {
  const queryClient = useQueryClient();
  const invalidateDownloadSubscriberQuery = useCallback(
    async (clientId: GameClientId) => {
      const downloadSubscriberQuery = downloadProgressQueryOptions(clientId);
      await queryClient.invalidateQueries(downloadSubscriberQuery);
    },
    [queryClient],
  );

  return { invalidateDownloadSubscriberQuery };
};

const useDownloadSubscriber = (
  clientId: GameClientId,
  onSuccess: () => void,
): {
  isLoading: boolean;
  downloadProgressInfo: DownloadProgressInfo | "NOT_FOUND";
} => {
  const isUnmountedRef = useIsUnmountedRef();
  const { invalidateDownloadSubscriberQuery } = useInvalidateDownloadSubscriberQuery();
  const { downloadsList } = useDownloadQueueProvider();

  const {
    isLoading,
    data: downloadProgressInfo,
    refetch,
  } = useSuspenseQuery(downloadProgressQueryOptions(clientId));

  useEffect(() => {
    if (isUnmountedRef.current) return;
    const downloadIndex = downloadsList.findIndex(({ gameClientId }) => gameClientId === clientId);

    // This happens when the download process is canceled and removeDownloadItemAndNotifyRenderer is called
    if (downloadIndex === -1) {
      void invalidateDownloadSubscriberQuery(clientId);
    }
  }, [clientId, downloadsList, invalidateDownloadSubscriberQuery, isUnmountedRef]);

  useEffect(() => {
    if (isUnmountedRef.current) return;

    if (downloadProgressInfo === "NOT_FOUND") return;
    if (isInstallSuccess(downloadProgressInfo)) {
      onSuccess();
    }
  }, [downloadProgressInfo, onSuccess, isUnmountedRef]);

  const { addSubscriber } = useDownloadProgressProvider();
  useLayoutEffect(() => {
    return addSubscriber(clientId, () => {
      void refetch();
    });
  }, [clientId, addSubscriber, refetch]);

  return { isLoading, downloadProgressInfo };
};

export default useDownloadSubscriber;
