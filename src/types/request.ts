import { type BaseFetchError } from "@src/const/error";

export type ApiName = (typeof ApiNames)[keyof typeof ApiNames];

export const ApiNames = {
  games: "games",
  game: "game",
  news: "news",
  banner: "banner",
  redeem: "redeem",
  gameUpdate: "gameUpdate",
  configs: "configs",
  node_getGameSession: "node_getGameSession",
  node_heartBeat: "node_heartBeat",
  node_getLogout: "node_getLogout",
  node_postSession: "node_postSession",
  node_verifySession: "node_verifySession",
} as const;

export type SerializableParams = object;

type BaseRequest<TParams extends SerializableParams> = {
  url: string;
  params: TParams;
  apiName: ApiName;
};

type GetRequest<TParams extends SerializableParams> = BaseRequest<TParams> & {
  method: "GET";
};
type PostRequest<TParams extends SerializableParams> = BaseRequest<TParams> & {
  method: "POST";
  body: unknown;
};

export type RequestOnRenderer<TParams extends SerializableParams> =
  | GetRequest<TParams>
  | PostRequest<TParams>;

export interface RequestFromNodeToRenderer<TParams extends SerializableParams> {
  requestId: string;
  request: RequestOnRenderer<TParams>;
  overrideSession?: string;
}

export interface ResultFromRendererToNode<TResult> {
  requestId: string;
  data: TResult;
  error?: BaseFetchError;
}
