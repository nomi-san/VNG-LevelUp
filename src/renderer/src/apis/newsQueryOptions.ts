import { queryOptions } from "@tanstack/react-query";

import type { GameClientId } from "@src/types/game";

import { fetchNews } from "./news";
import type { ApiParams } from "./shared";

export const newsQueryOptions = (
  params: ApiParams<{ gameClientId: GameClientId; enabled: boolean }>,
) =>
  queryOptions({
    queryKey: ["news", params],
    queryFn: () => fetchNews(params),
    enabled: params.enabled,
    refetchOnWindowFocus: false,
  });
