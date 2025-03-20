import { net, type ClientRequestConstructorOptions } from "electron/main";
import { v4 as uuidv4 } from "uuid";

import { BaseFetchError, isBaseErrorCode } from "@src/const/error";

import nodeLogger from "../../logger/serverLogger";

const generateRequestId = () => {
  return uuidv4();
};
export interface Chunk<TData> {
  data: TData;
  status: boolean;
  error: string;
  errorDescription: string;
  errorCode: string;
  errorMessage: string;
}

interface BaseRequest {
  url: string;
  session?: string;
}
interface GetRequest extends BaseRequest {
  method: "GET";
}
interface PostRequest extends BaseRequest {
  method: "POST";
  body: object;
}
type SupportedRequestType = GetRequest | PostRequest;

// TODO: It's not really a fetch error, we need another type of error for this, and then remove this
const UNKNOWN_ERROR_CODE = 400;

export function makeRequest<TData>(
  params: SupportedRequestType,
  customHeaders: Record<string, string> = {},
): Promise<TData> {
  nodeLogger.debug("Making Request", params);
  const { url, session, method } = params;
  nodeLogger.debug(`[${method}]`, url);
  const headers: ClientRequestConstructorOptions["headers"] = {
    ...customHeaders,
  };
  if (session) {
    headers["Cookie"] = `shared_ecn_session=${session}`;
    headers["Authorization"] = `Bearer ${session}`;
  }
  nodeLogger.debug("headers", headers);
  if (method === "POST") headers["Content-Type"] = "application/json";

  const body = method === "POST" ? JSON.stringify(params.body) : undefined;

  const requestId = generateRequestId();
  return new Promise<TData>((resolve, reject) => {
    const request = net.request({
      method,
      url,
      headers,
    });

    if (body) request.write(body);

    request.on("response", (response) => {
      nodeLogger.debug(`STATUS: ${response.statusCode}`);
      nodeLogger.debug(`HEADERS: ${JSON.stringify(response.headers)}`);

      response.on("data", (chunk) => {
        nodeLogger.debug(`DATA: ${chunk}`);
        try {
          const json: Chunk<TData> = JSON.parse(chunk.toString());
          if (json && (json.status || json.data)) {
            resolve(json.data);
          } else {
            const errorCode: string = json.error || json.errorCode;
            if (isBaseErrorCode(errorCode)) {
              reject(
                new BaseFetchError({
                  code: errorCode,
                  message: json.errorDescription || json.errorMessage,
                  requestId,
                  statusCode: response.statusCode,
                }),
              );
            }
            reject(
              new BaseFetchError({
                code: "unknown",
                message: json.errorDescription || json.errorMessage,
                requestId,
                statusCode: response.statusCode,
              }),
            );
          }
        } catch (error) {
          nodeLogger.error("[UNKNOWN ERROR]", params, error);
          reject(
            new BaseFetchError({
              code: "unknown",
              message: "",
              requestId,
              statusCode: response.statusCode,
            }),
          );
        }
      });
      response.on("end", () => {
        nodeLogger.debug("No more data in response.");
      });
    });

    request.on("error", (error) => {
      nodeLogger.error(error, `problem with request: ${error.message}`);
      reject(
        new BaseFetchError({
          code: "unknown",
          message: error.message ?? "",
          requestId,
          statusCode: UNKNOWN_ERROR_CODE,
        }),
      );
    });
    request.end();
  });
}
