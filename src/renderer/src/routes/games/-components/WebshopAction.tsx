import { useNavigate } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useTracking } from "@renderer/analytics";
import { PortalToNavAnimated } from "@renderer/components/PortalToNav";
import { Button } from "@renderer/components/ui/button";
import useGetLocalGameInfo from "@renderer/hooks/useGetLocalGameInfo";
import { useForceLoginProvider } from "@renderer/providers/ForceLoginProvider";

import { type DetailsPageGameInfo } from "@src/types/game";

export const WebshopAction = ({
  game,
  actionIsInView,
}: {
  game: DetailsPageGameInfo;
  actionIsInView: boolean;
}): JSX.Element => {
  const { track } = useTracking();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { triggerForceLoginWebshop } = useForceLoginProvider();
  const { data: localGameInfo } = useGetLocalGameInfo(game.id);

  if (!localGameInfo) return <></>;

  const onClickWebshop = async (): Promise<void> => {
    if (game.shopType === "sird") {
      const result = await triggerForceLoginWebshop(
        {
          name: "ACCESS_WEBSHOP",
          payload: {
            redirectUrl: game.shopUrl,
            gameClientId: game.id,
          },
        },
        game.shopType,
      );
      if (result === "can-not-continue") return;

      track({
        name: "view_webshop",
        payload: {
          gameId: game.id,
          source: "shop_button",
          webshopUrl: game.shopUrl,
        },
      });
      void navigate({
        to: "/shop",
        search: {
          gameWebshopUrl: game.shopUrl,
        },
      });
      return;
    } else {
      track({
        name: "view_webshop",
        payload: {
          gameId: game.id,
          source: "shop_button",
          webshopUrl: game.shopUrl,
        },
      });

      if (game.shopType === "sinrd") {
        void navigate({
          to: "/shop",
          search: {
            gameWebshopUrl: game.shopUrl,
          },
        });
      } else {
        window.api.app_openExternalWeb(game.shopUrl);
      }
    }
  };

  const sharedButtonProps = {
    variant: "subtle",
    className: "!font-bold w-full rounded-lg uppercase",
    onClick: onClickWebshop,
  } as const;
  const shouldUsePortal = !actionIsInView;
  return (
    <>
      <Button size="xl" {...sharedButtonProps}>
        <ShoppingCart className="body-14-regular mr-4" />
        {t("actions.shopping")}
      </Button>
      <PortalToNavAnimated shouldUsePortal={shouldUsePortal} gameId={game.id} portal="shop">
        <Button size="lg" {...sharedButtonProps}>
          <ShoppingCart className="body-14-regular mr-2" />
          {t("actions.shopping")}
        </Button>
      </PortalToNavAnimated>
    </>
  );
};
