import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";

import { FROM_RENDERER_STORE_GET_GAME_INFO } from "@src/const/events";
import type { GameClientId } from "@src/types/game";

export const localGameQueryOptions = (gameClientId: GameClientId) =>
  queryOptions({
    queryKey: [FROM_RENDERER_STORE_GET_GAME_INFO, { gameClientId }],
    queryFn: () => window.api.store_getGameInfo(gameClientId),
  });
const useGetLocalGameInfo = (clientId: GameClientId) => {
  return useSuspenseQuery(localGameQueryOptions(clientId));
};

export const useInvalidateQueryLocalGameInfo = () => {
  const queryClient = useQueryClient();

  const invalidateQueryLocalGameInfo = async (clientId: GameClientId) => {
    await queryClient.invalidateQueries({
      queryKey: [FROM_RENDERER_STORE_GET_GAME_INFO, { gameClientId: clientId }],
    });
  };

  return { invalidateQueryLocalGameInfo };
};

export default useGetLocalGameInfo;
