import { useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useEffect, useLayoutEffect, useState } from "react";

import logoNoBg from "@renderer/assets/logo-no-bg.svg";
import { Button } from "@renderer/components/ui/button";
import { useSessionProvider } from "@renderer/providers/SessionProvider";
import { MinigamesButton } from "@renderer/routes/-components/MinigamesButton";
import { isDevEnvironment } from "@renderer/utils/common";

import {
  FROM_NODE_PAGE_ACCOUNT_UPDATE_NAVIGATION,
  FROM_NODE_PAGE_SHOP_UPDATE_NAVIGATION,
} from "@src/const/events";
import type { CanGo } from "@src/types/window-arranger";

const HomeButtons = (): JSX.Element => {
  const {
    location: { pathname },
  } = useRouterState();
  const router = useRouter();
  const { isValidatingUserSession } = useSessionProvider();
  const [shouldDisableForward, setShouldDisableForward] = useState(true);
  const goBack = pathname === "/shop" ? window.api.shop_goBack : window.api.account_goBack;
  const goForward = pathname === "/shop" ? window.api.shop_goForward : window.api.account_goForward;
  const navigate = useNavigate();

  useLayoutEffect(() => {
    if (pathname !== "/shop") return;
    return window.api.app_addListener(
      FROM_NODE_PAGE_SHOP_UPDATE_NAVIGATION,
      (_, { forward }: CanGo) => {
        setShouldDisableForward(!forward);
      },
    );
  }, [navigate, pathname]);

  useEffect(() => {
    if (pathname !== "/account") return;

    return window.api.app_addListener(
      FROM_NODE_PAGE_ACCOUNT_UPDATE_NAVIGATION,
      (_, { forward }: CanGo) => {
        setShouldDisableForward(!forward);
      },
    );
  }, [pathname]);

  return pathname === "/" ? (
    <>
      {isDevEnvironment() && <MinigamesButton />}
      {isValidatingUserSession && <Loader2 className="h-4 w-4 animate-spin" />}
    </>
  ) : pathname === "/account" || pathname === "/shop" ? (
    <>
      <img src={logoNoBg} className="ml-[-60px] mr-[22px]" />
      <Button
        variant="ghost"
        size="icon-md"
        className="ml-[-8px]"
        onClick={() => {
          void goBack().then((canGo) => {
            if (canGo === "should-unmount") {
              router.history.back();
            }
          });
        }}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        disabled={shouldDisableForward}
        variant="ghost"
        size="icon-md"
        onClick={() => {
          void goForward().then((canGo) => {
            if (canGo === "should-unmount") {
              router.history.forward();
            }
          });
        }}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </>
  ) : (
    <></>
  );
};

export default HomeButtons;
