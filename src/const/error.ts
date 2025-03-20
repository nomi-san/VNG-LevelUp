import { type ApiName } from "@src/types/request";

export type ErrorCode =
  | "unknown"
  | "connection_failed"
  | "unauthorized"
  | "session_not_found"
  | "state_not_identical"
  | "invalid_request"
  | "server_error"
  | "invalid_request"
  | `${ApiName}_not_ok`;

export function isBaseErrorCode(value: string): value is ErrorCode {
  return (
    value === "unknown" ||
    value === "connection_failed" ||
    value === "unauthorized" ||
    value === "session_not_found" ||
    value === "state_not_identical" ||
    value === "invalid_request" ||
    value === "game_not_ok" ||
    value === "games_not_ok" ||
    value === "news_not_ok" ||
    value === "banner_not_ok" ||
    value === "redeem_not_ok" ||
    value === "gameUpdate_not_ok" ||
    value === "server_error" ||
    value === "invalid_request"
  );
}

export const CommonRequestStatusCode = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  SERVER_ERROR: 500,
  BAD_INTERNET: 408, // TODO: Actually i'm not so sure about this one
};

export class BaseFetchError extends Error {
  code: ErrorCode;
  message: string;
  requestId: string;
  statusCode: number;

  constructor({
    code,
    message,
    requestId,
    statusCode,
  }: {
    code: ErrorCode;
    message: string;
    requestId: string;
    statusCode: number;
  }) {
    super();
    this.code = code;
    this.message = message;
    this.requestId = requestId;
    this.statusCode = statusCode;
  }
}

export class BaseFetchErrorTempForWebMode extends BaseFetchError {
  constructor() {
    super({
      code: "invalid_request",
      message: "Invalid request",
      requestId: "",
      statusCode: 400,
    });
  }
}
