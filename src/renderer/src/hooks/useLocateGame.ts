import { queryOptions, useQuery } from "@tanstack/react-query";

import { FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES } from "@src/const/events";
import type { DetailsPageGameInfo } from "@src/types/game";

export const localGameIdsQueryOptions = (params: DetailsPageGameInfo) =>
  queryOptions({
    queryKey: [FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES, params],
    queryFn: () => window.api.locateGame(params),
    enabled: false,
  });

const useLocateGame = (params: DetailsPageGameInfo) => {
  return useQuery(localGameIdsQueryOptions(params));
};

export default useLocateGame;
