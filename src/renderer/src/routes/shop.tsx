import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";

import type { ShopMountParams } from "@src/types/window-arranger";

type ShopSearch = {
  gameWebshopUrl: string;
};
export const Route = createFileRoute("/shop")({
  component: Shop,
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    return {
      gameWebshopUrl: (search.gameWebshopUrl as string) || "",
    };
  },
});

function Shop(): JSX.Element {
  const { gameWebshopUrl } = Route.useSearch();
  useLayoutEffect(() => {
    const params: ShopMountParams = {
      gameWebshopUrl: gameWebshopUrl,
    };

    window.api.shop_mount(params);
    return (): void => {
      window.api.shop_unmount();
    };
  }, [gameWebshopUrl]);

  return <></>;
}
