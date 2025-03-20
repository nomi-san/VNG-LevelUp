import { Link, useRouterState } from "@tanstack/react-router";

import logoNoBg from "@renderer/assets/logo-no-bg.svg";
import menuIcon from "@renderer/assets/sidebar/menu.svg";
import { Badge } from "@renderer/components/ui/badge";
import { useTranslation } from "@renderer/i18n/useTranslation";

import { GameDownloadTrackerList } from "../download/GameDownloadTracker";
import LoginButton from "../LoginButton";
import { ActiveItemWrapper } from "./ActiveItemWrapper";
import { HoverSidebarItemWrapper } from "./HoverSidebarItemWrapper";

export const SideBar = (): JSX.Element => {
  const {
    location: { pathname },
  } = useRouterState();
  const { t } = useTranslation();
  return (
    <div
      className={`${pathname === "/account" || pathname === "/shop" ? "invisible" : ""} fixed inset-0 z-50 flex h-full w-[60px] max-w-[60px] flex-col items-center justify-end gap-3 bg-[#00000026] py-3 backdrop-blur`}
    >
      <img src={logoNoBg} className="fixed left-3 top-[10px]" />
      <Badge className="fixed left-2.5 top-[54px] rounded-[2px] border-none bg-neutral-800 px-1.5 py-1 text-[10px] uppercase text-neutral-300">
        Beta
      </Badge>
      <div className="flex w-full flex-col justify-end gap-3">
        <GameDownloadTrackerList />
        <ActiveItemWrapper isActive={pathname === "/"}>
          <HoverSidebarItemWrapper content={t("sideBar.allGames")}>
            <Link
              to="/"
              className="flex h-12 w-12 items-center justify-center [&.active]:font-bold"
            >
              <img src={menuIcon} className="h-6 w-6" />
            </Link>
          </HoverSidebarItemWrapper>
        </ActiveItemWrapper>
        <ActiveItemWrapper>
          <div className="flex h-12 w-12 items-center justify-center">
            <LoginButton />
          </div>
        </ActiveItemWrapper>
      </div>
    </div>
  );
};
