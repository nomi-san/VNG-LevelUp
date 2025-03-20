import { createHash, randomBytes } from "crypto";

import nodeLogger from "@src/logger/serverLogger";
import type { LoginStateInfo } from "@src/types/auth";
import type { PlayGameStateInfo } from "@src/types/native-game";

export const genRandomString = (length: number): string => {
  return randomBytes(length).toString("hex");
};

export const generateCodeVerifier = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = Buffer.from(array).toString("base64");
  return verifier;
};

export const generateCodeChallengeForLogin = (codeVerifier: string): string => {
  const hash = createHash("sha256");
  hash.update(codeVerifier);
  const hashBase64 = hash.digest("base64");
  return hashBase64;
};

export const generateCodeChallengeForGameSession = (codeVerifier: string): string => {
  const hash = createHash("sha256");
  hash.update(codeVerifier);
  const hashBase64 = hash.digest("base64");

  const codeChallenge = hashBase64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return codeChallenge;
};

export type GeneratedState = string;
export const generateState = (
  extendedInfoObj: LoginStateInfo | PlayGameStateInfo,
): GeneratedState => {
  const randomStr = genRandomString(32);
  if (!extendedInfoObj) {
    return btoa(
      JSON.stringify({
        randomStr,
      }),
    );
  } else {
    const state = {
      randomStr,
      ...extendedInfoObj,
    };
    return btoa(JSON.stringify(state));
  }
};

export const decodeState = (
  encodedStateInfo: string,
): LoginStateInfo | PlayGameStateInfo | null => {
  try {
    const decodedString = atob(encodedStateInfo);
    return JSON.parse(decodedString);
  } catch (error) {
    nodeLogger.error(error, "Failed to decode state");
    return null;
  }
};
