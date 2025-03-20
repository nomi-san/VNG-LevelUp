export interface VgaUser {
  ggId: string;
  displayName: string;
  avatar: string;
  territory: string;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  sessionClientInfo: {
    signInMethod: string;
    sessionClientId: string;
    sessionTargetClientId: string;
    sessionClientName: string;
    sessionClientAvatarUrl: string;
  };
  gameAccountInfo: unknown;
}

export interface LauncherUser {
  signInId: string;
  userId: string;
  channel: number;
}
