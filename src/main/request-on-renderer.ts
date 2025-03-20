import { ipcMain, type WebContentsView } from "electron/main";

import { BaseFetchError } from "@src/const/error";
import { FROM_NODE_MAKE_REQUEST, FROM_RENDERER_RETURN_REQUEST_RESULT } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import type {
  RequestFromNodeToRenderer,
  ResultFromRendererToNode,
  SerializableParams,
} from "@src/types/request";

const requestsMap: Record<
  string,
  {
    resolve: (data: unknown) => void;
    reject: (error: unknown) => void;
  }
> = {};

const handleForwardRequestToRenderer = () => {
  ipcMain.handle(
    FROM_RENDERER_RETURN_REQUEST_RESULT,
    (_, { requestId, data, error }: ResultFromRendererToNode<unknown>) => {
      const requestPromise = requestsMap[requestId];

      if (!requestPromise) return;

      if (error) {
        nodeLogger.error(error, "error from forwarding to renderer");

        requestPromise.reject(new BaseFetchError(error));
      } else {
        requestPromise.resolve(data);
      }

      delete requestsMap[requestId];
    },
  );

  return { forwardRequestToRenderer };
};

export const forwardRequestToRenderer = <TResult>({
  appContentView,
  request,
  overrideSession,
}: {
  appContentView: WebContentsView;
  request: RequestFromNodeToRenderer<SerializableParams>["request"];
  overrideSession?: string;
}): Promise<TResult> => {
  const requestId = Date.now().toString();
  return new Promise((resolve, reject) => {
    const requestFromNodeToRenderer: RequestFromNodeToRenderer<SerializableParams> = {
      requestId,
      request,
      overrideSession,
    };
    appContentView.webContents.send(FROM_NODE_MAKE_REQUEST, requestFromNodeToRenderer);

    requestsMap[requestId] = {
      resolve: resolve as (data: unknown) => void,
      reject,
    };
  });
};

export default handleForwardRequestToRenderer;
