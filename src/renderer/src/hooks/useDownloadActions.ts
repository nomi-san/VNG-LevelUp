import { useTracking } from "@renderer/analytics";

import type { GameClientId } from "@src/types/game";
import type { DownloadItemInteractionParams } from "@src/types/system";

const useDownloadActions = (
  gameClientId: GameClientId,
  downloadInitTime: number,
  internalVersion: number,
) => {
  const { track } = useTracking();
  const resume = (): void => {
    const params: DownloadItemInteractionParams = { gameClientId, internalVersion };
    track({
      name: "download_resume",
      payload: {
        gameId: gameClientId,
        download_init_time: downloadInitTime,
        internal_version: internalVersion,
      },
    });
    window.api.download_resume(params);
  };

  const pause = (): void => {
    track({
      name: "download_pause",
      payload: {
        gameId: gameClientId,
        download_init_time: downloadInitTime,
        internal_version: internalVersion,
      },
    });
    const params: DownloadItemInteractionParams = { gameClientId, internalVersion };
    window.api.download_pause(params);
  };

  const cancel = (): void => {
    track({
      name: "download_cancel",
      payload: {
        gameId: gameClientId,
        source: "cancel",
        download_init_time: downloadInitTime,
        internal_version: internalVersion,
      },
    });
    const params: DownloadItemInteractionParams = { gameClientId, internalVersion };
    window.api.download_cancel(params);
  };

  const retry = (): void => {
    track({
      name: "download_retry",
      payload: {
        gameId: gameClientId,
        download_init_time: downloadInitTime,
        internal_version: internalVersion,
      },
    });
    const params: DownloadItemInteractionParams = { gameClientId, internalVersion };
    window.api.download_retry(params);
  };

  return { resume, pause, cancel, retry };
};

export default useDownloadActions;
