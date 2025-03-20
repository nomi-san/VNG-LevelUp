export interface LoggerUserInfo {
  guestId: string;
  launcherUserId: string;
  ggId: string;
}

export interface GlobalExtras extends Record<string, unknown> {
  Origin: string;
}
