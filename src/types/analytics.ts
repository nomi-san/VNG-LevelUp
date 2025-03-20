export interface InfoForAnalytics {
  appVersion: string;
  platform: NodeJS.Platform;
  appOpenTime: number;
  environment: "test" | "stg" | "production";
}

export interface StandardAnalyticsEvent {
  event: "event_tracking";
  event_name: string;
  launcherUserId: string | null;
  vga_id: string | null;
  data_info: Record<string, unknown>;
  guest_id: string;
}
