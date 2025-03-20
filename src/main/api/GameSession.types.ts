// This file is used for both Electron and GameSession Instance
// So it should not have any dependencies or Electron specific code

export interface GameSessionRequestParams {
  codeChallenge: string;
  gameClientId: string;
  userSession: string;
  state: string;
}

export interface GameSessionResponse {
  state: string;
  code?: string;
  redirectUrl?: string;
}
