import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE } from "@src/const/events";
import type { GameClientId } from "@src/types/game";

const useGetLocalRedeemCodeInfo = (clientId: GameClientId) => {
  return useQuery(
    queryOptions({
      queryKey: [FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE, { gameClientId: clientId }],
      queryFn: () => window.api.redeem_getUserHasRedeemedCode({ clientId }),
    }),
  );
};

export const useInvalidateLocalRedeemCodeInfo = (clientId: GameClientId) => {
  const queryClient = useQueryClient();
  return useCallback(
    (): Promise<void> =>
      queryClient.invalidateQueries({
        queryKey: [FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE, { gameClientId: clientId }],
      }),
    [queryClient, clientId],
  );
};

export default useGetLocalRedeemCodeInfo;
