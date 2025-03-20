import { useCallback } from "react";

import { useSessionProvider } from "@renderer/providers/SessionProvider";
import { isDevEnvironment } from "@renderer/utils/common";

import type { InfoForAnalytics } from "@src/types/analytics";

import { hma, initHomemadeAnalytics, makeHmaEvent } from "./homemade";
import type { SurveyEvent, TrackedEvent } from "./types";

export const initTracking = (info: InfoForAnalytics): void => {
  initHomemadeAnalytics(info);
};

export const useTracking = (): {
  track: (event: TrackedEvent | SurveyEvent) => void;
} => {
  const { launcherUser, guestId } = useSessionProvider();

  const track = useCallback(
    ({ name, payload }: TrackedEvent | SurveyEvent) => {
      hma.trackEvent(
        makeHmaEvent({
          launcherUserId: launcherUser?.userId,
          vga_id: launcherUser?.signInId,
          guestId,
          event_name: name,
          data_info: payload,
        }),
      );
    },
    [guestId, launcherUser?.userId, launcherUser?.signInId],
  );

  return { track: isDevEnvironment() ? (): void => {} : track };
};
