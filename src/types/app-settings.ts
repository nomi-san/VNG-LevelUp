export type CloseWindowSetting = "MINIMIZE_TO_TRAY" | "EXIT_LAUNCHER";

export interface NotificationPayload {
  title: string;
  body: string;
}

export type NotificationPermission = "DENIED" | "GRANTED";
