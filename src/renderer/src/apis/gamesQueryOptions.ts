import { queryOptions } from "@tanstack/react-query";

import { fetchGames } from "./games";
import type { ApiParams } from "./shared";

export const gamesQueryOptions = (params: ApiParams) =>
  queryOptions({
    queryKey: ["games", params],
    queryFn: () => fetchGames(params),
  });
