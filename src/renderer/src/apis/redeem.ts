import { queryOptions } from "@tanstack/react-query";

import { makeRequestOnRenderer, type ApiParams } from "@renderer/apis/shared";
import { envRender } from "@renderer/env-render";

import type { GameClientId } from "@src/types/game";
import { type RemoteRedeemCodeInfo } from "@src/types/redeem";

const fetchGameRedeemInfo = async (
  params: ApiParams<{ gameClientId: GameClientId }>,
): Promise<RemoteRedeemCodeInfo> => {
  return makeRequestOnRenderer({
    url: `https://${envRender.gameService}/api/promotion/v1/gift-code/${params.gameClientId}`,
    method: "GET",
    params: params,
    apiName: "redeem",
  });
};

const GET_REDEEM_CODE_CACHED_TIME = 10 * 60 * 1000;
export const redeemQueryOptions = (
  params: ApiParams<{ gameClientId: GameClientId }>,
  enabled: boolean,
) =>
  queryOptions({
    queryKey: ["redeem", params],
    queryFn: () => fetchGameRedeemInfo(params),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: GET_REDEEM_CODE_CACHED_TIME,
  });
