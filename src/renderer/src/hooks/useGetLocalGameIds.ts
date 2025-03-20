import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { FROM_RENDERER_STORE_GET_ALL_GAME_IDS } from "@src/const/events";

export const localGameIdsQueryOptions = () =>
  queryOptions({
    queryKey: [FROM_RENDERER_STORE_GET_ALL_GAME_IDS],
    queryFn: () => window.api.store_getAllGameIds(),
  });

const useGetLocalGameIds = () => {
  return useQuery(localGameIdsQueryOptions());
};

export const useInvalidateQueryLocalGameIds = () => {
  const queryClient = useQueryClient();

  const invalidateQueryLocalGameIds = async () => {
    await queryClient.invalidateQueries({
      queryKey: [FROM_RENDERER_STORE_GET_ALL_GAME_IDS],
    });
  };

  return { invalidateQueryLocalGameIds };
};

export default useGetLocalGameIds;
