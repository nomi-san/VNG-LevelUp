import { v4 as uuidv4 } from "uuid";

import { BaseFetchError, CommonRequestStatusCode } from "@src/const/error";
import type { SupportedLanguage } from "@src/const/language";
import { type RequestOnRenderer } from "@src/types/request";

const generateUUIDV4 = (): string => {
  return uuidv4();
};

export interface MandatoryApiFields {
  language: SupportedLanguage;
  guestId: string;
  userId?: string;
  session?: string;
}

export type ApiParams<T = unknown> = MandatoryApiFields & T;

// Follows https://vnggames.atlassian.net/wiki/spaces/Launcher/pages/234979448/Eng.+API+documentation+overview
const makeHeaders = ({
  language,
  guestId,
  userId,
  session,
  method,
  requestId,
}: MandatoryApiFields & { method: "GET" | "POST"; requestId: string }): HeadersInit => {
  const headers: HeadersInit = {
    "NX-Country-Code": "VN",
    "NX-Lang": language,
    "NX-Guest-ID": guestId,
    "X-Request-ID": requestId,
  };

  if (userId) headers["NX-User-ID"] = userId;

  if (session) {
    headers["Authorization"] = `Bearer ${session}`;
  }

  if (method === "POST") headers["Content-Type"] = "application/json";

  return headers;
};

export const makeRequestOnRenderer = async <TResult, TParams = unknown>(
  request: RequestOnRenderer<ApiParams<TParams>>,
): Promise<TResult> => {
  let response: Response;
  const { url, method, params, apiName } = request;
  const requestId = generateUUIDV4();

  try {
    response = await fetch(url, {
      method,
      headers: makeHeaders({
        ...params,
        method,
        requestId,
      }),
      body: request.method === "POST" ? JSON.stringify(request.body) : undefined,
    });
  } catch (error) {
    throw new BaseFetchError({
      code: "connection_failed",
      message: `Connection failed`,
      requestId,
      statusCode: CommonRequestStatusCode.BAD_INTERNET,
    });
  }

  const json = await response.json();

  // Currently, we can't mock response.ok in automated test environment yet, we can only mock json.ok
  // TODO: mock response.ok in automated test environment so that we don't need to mock json.ok
  if (!(response.ok || json.ok)) {
    throw new BaseFetchError({
      code: `${apiName}_not_ok`,
      message: json.error || json.description,
      requestId,
      statusCode: response.status,
    });
  }

  if (!(json && json.status && json.data))
    throw new BaseFetchError({
      code: json.error,
      message: json.description,
      requestId,
      statusCode: response.status,
    });

  return json.data;
};
