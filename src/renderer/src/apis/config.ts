import { queryOptions } from "@tanstack/react-query";

import { envRender } from "@renderer/env-render";

import type { ConfigInfo } from "@src/types/config";

import { makeRequestOnRenderer, type ApiParams } from "./shared";

const QUERY_KEY_CONFIGS = "configs";

export const configQueryOptions = (params: ApiParams) =>
  queryOptions({
    queryKey: [QUERY_KEY_CONFIGS, params],
    queryFn: () => fetchConfigs(params),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: true,
    retryDelay: 1000 * 5, // 5s
    refetchInterval: ({ state: { data } }) => {
      if (data?.nextCallInSeconds) return data.nextCallInSeconds * 1000;
      return false;
    },
  });

const fetchConfigs = async (params: ApiParams): Promise<ConfigInfo> => {
  return makeRequestOnRenderer({
    url: `https://${envRender.gameService}/api/client/v1/configs`,
    method: "GET",
    apiName: "configs",
    params: params,
  });
};
