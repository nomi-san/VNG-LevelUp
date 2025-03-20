import { queryOptions } from "@tanstack/react-query";

import type { GameClientId } from "@src/types/game";

import { fetchGame } from "./games";
import type { ApiParams } from "./shared";

export const gameQueryOptions = (params: ApiParams<{ gameClientId: GameClientId }>) =>
  queryOptions({
    queryKey: ["games", params],
    queryFn: () => fetchGame(params),
    refetchOnWindowFocus: false,
  });
