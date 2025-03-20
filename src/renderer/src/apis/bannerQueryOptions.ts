import { queryOptions } from "@tanstack/react-query";

import type { GameClientId } from "@src/types/game";

import { fetchBanner } from "./banner";
import type { ApiParams } from "./shared";

export const bannerQueryOptions = (
  params: ApiParams<{ gameClientId: GameClientId; enabled: boolean }>,
) =>
  queryOptions({
    queryKey: ["banners", params],
    queryFn: () => fetchBanner(params),
    enabled: params.enabled,
    refetchOnWindowFocus: false,
  });
