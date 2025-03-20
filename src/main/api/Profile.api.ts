import type { WebContentsView } from "electron/main";

import { SERVICE_ID } from "@src/main/const/auth";
import { envNode } from "@src/main/env-node";
import { forwardRequestToRenderer } from "@src/main/request-on-renderer";
import { makeParams } from "@src/main/utils/common";
import { makeRequest } from "@src/main/utils/request";
import type { BuildLoginInfo } from "@src/types/auth";
import type { LauncherUser, VgaUser } from "@src/types/user";

import launcherStore from "../store";

export const buildLoginUrl = (buildLoginInfo: BuildLoginInfo): string => {
  const loginSSOPath = "/api/auth/v1/sso";
  const params = makeParams(buildLoginInfo);
  const searchParams = new URLSearchParams(params);

  const url = new URL(`https://${envNode.launcher}${loginSSOPath}`);
  url.search = searchParams.toString();
  return url.toString();
};

type Session = {
  session: string;
  signInId: string;
  userId: string;
  channel: number;
};
export async function callPostSession(
  appContentView: WebContentsView,
  code: string,
  codeVerifier: string,
): Promise<Session> {
  const exchangeSSOPath = "/api/auth/v1/sso/exchange";
  const body = {
    serviceId: SERVICE_ID,
    code,
    requestVerifier: codeVerifier,
  } as const;

  return forwardRequestToRenderer({
    appContentView,
    request: {
      method: "POST",
      url: `https://${envNode.launcher}${exchangeSSOPath}`,
      body,
      apiName: "node_postSession",
      params: {},
    },
  });
}

export async function callGetVgaUser(userSession: string): Promise<VgaUser> {
  return makeRequest<VgaUser>({
    method: "GET",
    url: `https://${envNode.login}/api/v1/users/basic-profile`,
    session: userSession,
  });
}

export async function callGetLogout(appContentView: WebContentsView): Promise<void> {
  return forwardRequestToRenderer({
    appContentView,
    request: {
      method: "GET",
      url: `https://${envNode.launcher}/api/auth/v1/sso/sign-out`,
      params: {},
      apiName: "node_getLogout",
    },
  });
}

export async function callVerifySession(
  appContentView: WebContentsView,
  session: string,
): Promise<LauncherUser> {
  return forwardRequestToRenderer({
    appContentView,
    request: {
      method: "GET",
      url: `https://${envNode.launcher}/api/auth/v1/sso/verify-session`,
      apiName: "node_verifySession",
      params: {},
    },
    overrideSession: session,
  });
}

interface HeartBeatResponse {
  nextCallInSeconds: number | "STOP_CALLING";
}
export async function callHeartBeat(appContentView: WebContentsView): Promise<HeartBeatResponse> {
  const userSession = launcherStore.getUserSession();
  if (userSession) return { nextCallInSeconds: "STOP_CALLING" };

  return forwardRequestToRenderer({
    appContentView,
    request: {
      method: "POST",
      url: `https://${envNode.launcher}/api/guest/v1/heartbeat`,
      body: {},
      apiName: "node_heartBeat",
      params: {},
    },
  });
}

//import { SERVICE_ID } from "@src/main/const/auth";
//import { envNode } from "@src/main/env-node";
//import { makeParams } from "@src/main/utils/common";
//import { makeRequest } from "@src/main/utils/request";
//import type { BuildLoginInfo } from "@src/types/auth";
//import type { LauncherUser, User } from "@src/types/user";
//
//import launcherStore from "../store";
//
//export const buildLoginUrl = (buildLoginInfo: BuildLoginInfo): string => {
//  const loginSSOPath = "/api/auth/v1/sso";
//  const params = makeParams(buildLoginInfo);
//  const searchParams = new URLSearchParams(params);
//
//  const url = new URL(`https://${envNode.launcher}${loginSSOPath}`);
//  url.search = searchParams.toString();
//  return url.toString();
//};
//
//type Session = {
//  session: string;
//  signInId: string;
//  userId: string;
//  channel: number;
//};
//export async function callPostSession(code: string, codeVerifier: string): Promise<Session> {
//  const exchangeSSOPath = "/api/auth/v1/sso/exchange";
//  const body = {
//    serviceId: SERVICE_ID,
//    code,
//    requestVerifier: codeVerifier,
//  } as const;
//  return makeRequest<Session>({
//    method: "POST",
//    url: `https://${envNode.launcher}${exchangeSSOPath}`,
//    body,
//  });
//}
//
//export async function callGetUser(userSession: string): Promise<User> {
//  return makeRequest<User>({
//    method: "GET",
//    url: `https://${envNode.login}/api/v1/users/basic-profile`,
//    session: userSession,
//  });
//}
//
//export async function callGetLogout(userSession: string): Promise<void> {
//  return makeRequest<void>({
//    method: "GET",
//    url: `https://${envNode.launcher}/api/auth/v1/sso/sign-out`,
//    session: userSession,
//  });
//}
//
//export async function callVerifySession(userSession: string): Promise<LauncherUser> {
//  return makeRequest<LauncherUser>({
//    method: "GET",
//    url: `https://${envNode.launcher}/api/auth/v1/sso/verify-session`,
//    session: userSession,
//  });
//}
//interface HeartBeatResponse {
//  nextCallInSeconds: number | "STOP_CALLING";
//}
//export async function callHeartBeat(): Promise<HeartBeatResponse> {
//  const userSession = launcherStore.getUserSession();
//  if (userSession) return { nextCallInSeconds: "STOP_CALLING" };
//
//  const guestId = launcherStore.getGuestId();
//  return makeRequest<HeartBeatResponse>(
//    {
//      method: "POST",
//      url: `https://${envNode.launcher}/api/guest/v1/heartbeat`,
//      body: {},
//    },
//    {
//      "NX-Guest-ID": guestId,
//    },
//  );
//}
