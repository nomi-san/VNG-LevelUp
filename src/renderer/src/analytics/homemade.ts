import type { InfoForAnalytics, StandardAnalyticsEvent } from "@src/types/analytics";

const destinationUrl = "https://launcher-tracking.vnggames.net/launcher-tracking/g/collect";
interface HomemadeEvent extends StandardAnalyticsEvent {}

export const makeHmaEvent = ({
  launcherUserId,
  guestId,
  event_name,
  data_info,
  vga_id,
}: {
  launcherUserId: string | undefined;
  vga_id: string | undefined;
  guestId: string;
  event_name: string;
  data_info: Record<string, unknown>;
}): HomemadeEvent => {
  const result: HomemadeEvent = {
    event: "event_tracking",
    event_name: event_name,
    launcherUserId: launcherUserId || null,
    guest_id: guestId,
    data_info,
    vga_id: vga_id || null,
  };

  return result;
};

class HomemadeAnalytics {
  app_version: string;
  platform: NodeJS.Platform;
  appOpenTime: number;
  environment: string;

  constructor(info: InfoForAnalytics) {
    this.app_version = info.appVersion;
    this.platform = info.platform;
    this.appOpenTime = info.appOpenTime;
    this.environment = info.environment;
  }

  private makeTrackingRequest(params: HomemadeEvent): void {
    const searchParams = new URLSearchParams();
    // searchParams.append("id", "GTM-5SBW245K");
    searchParams.append("ts", Date.now().toString());
    searchParams.append("event_name", params.event_name);
    searchParams.append("event_value", JSON.stringify(params.data_info));
    searchParams.append("guest_id", params.guest_id);
    if (params.launcherUserId) searchParams.append("launcher_user_id", params.launcherUserId);
    if (params.vga_id) searchParams.append("vga_id", params.vga_id);
    searchParams.append("app_version", this.app_version);
    searchParams.append("platform", this.platform);
    searchParams.append("environment", this.environment);
    searchParams.append("app_open_time", this.appOpenTime.toString());

    const url = new URL(destinationUrl);
    url.search = searchParams.toString();

    void fetch(url)
      .then()
      .catch(() => {
        // TODO: Log this using node logger
        console.error(
          new Error("Failed to send tracking request"),
          "Failed to send tracking request",
        );
      });
  }

  trackEvent(event: HomemadeEvent): void {
    this.makeTrackingRequest(event);
  }
}
export let hma: HomemadeAnalytics;
export const initHomemadeAnalytics = (info: InfoForAnalytics): void => {
  hma = new HomemadeAnalytics(info);
};
