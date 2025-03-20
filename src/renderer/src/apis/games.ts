import { envRender } from "@renderer/env-render";
import { isRunningWebMode } from "@renderer/mode/web";

import { BaseFetchErrorTempForWebMode } from "@src/const/error";
import {
  MOCK_TEST_REMOTE_GAME_INFO,
  type DetailsPageGameInfo,
  type GameClientId,
  type ListPageGameInfo,
} from "@src/types/game";

import { makeRequestOnRenderer, type ApiParams } from "./shared";

export const gameClientDownLoadLinks = {} as const;

const fetchGameMock = async (gameClientId: string): Promise<DetailsPageGameInfo> => {
  const game = MOCK_TEST_REMOTE_GAME_INFO.find((game) => game.id === gameClientId);
  if (!game) {
    throw new BaseFetchErrorTempForWebMode();
  }
  return game;
};
export const fetchGame = async (
  params: ApiParams<{ gameClientId: GameClientId }>,
): Promise<DetailsPageGameInfo> => {
  if (isRunningWebMode) {
    const game = await fetchGameMock(params.gameClientId)
      .then((r) => r)
      .catch(() => {
        throw new BaseFetchErrorTempForWebMode();
      });

    return game;
  }

  // TODO: why do we have data.data?
  const response = await makeRequestOnRenderer<{ data: DetailsPageGameInfo }>({
    url: `https://${envRender.gameService}/api/product/v1/products/${params.gameClientId}?id=${params.gameClientId}`,
    method: "GET",
    params: params,
    apiName: "game",
  });
  return response.data;
};

export const fetchGames = async (params: ApiParams): Promise<{ items: ListPageGameInfo[] }> => {
  if (isRunningWebMode) return { items: MOCK_TEST_REMOTE_GAME_INFO };

  const { type, limit, offset } = {
    type: "host",
    limit: 20,
    offset: 0,
  };

  // TODO: why do we have data.items?
  return makeRequestOnRenderer({
    url: `https://${envRender.gameService}/api/product/v1/products?type=${type}&limit=${limit}&offset=${offset}`,
    method: "GET",
    params: params,
    apiName: "games",
  });
};
