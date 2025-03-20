import { envRender } from "@renderer/env-render";

import type { GameClientId } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

import { makeRequestOnRenderer, type ApiParams } from "./shared";

export const fetchGameUpdate = async (
  params: ApiParams<{ gameClientId: GameClientId; internalVersion: number }>,
): Promise<GameUpdateInfo> => {
  return makeRequestOnRenderer({
    url: `https://${envRender.gameService}/api/product/v1/products/${params.gameClientId}/updates?internal_version=${params.internalVersion}`,
    method: "GET",
    params,
    apiName: "gameUpdate",
  });
};
