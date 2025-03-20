import type { IpcRendererListener } from "@electron-toolkit/preload";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, User as UserIcon } from "lucide-react";
import { useCallback, useLayoutEffect, useState } from "react";

import { useTracking } from "@renderer/analytics";
import userIcon from "@renderer/assets/sidebar/user.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@renderer/components/ui/avatar";
import { Button } from "@renderer/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@renderer/components/ui/dropdown-menu";
import useToast from "@renderer/hooks/useToast";
import useWebviewArranger from "@renderer/hooks/useWebviewArranger";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useClientLogger } from "@renderer/providers/ClientLoggerProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import { FROM_NODE_UPDATE_USER_SESSION } from "@src/const/events";
import type { LoginStateInfo, UpdateUserSessionParams } from "@src/types/auth";
import type { VgaUser } from "@src/types/user";

import { HoverSidebarItemWrapper } from "./sidebar/HoverSidebarItemWrapper";

const useHandleNavigateFromLoginState = (): {
  handleNavigateFromLoginState: (state: LoginStateInfo) => void;
} => {
  const navigate = useNavigate();

  const { track } = useTracking();
  const clientLogger = useClientLogger();
  const handleNavigateFromLoginState = useCallback(
    (state: LoginStateInfo | undefined): void => {
      clientLogger.log("[DECODED STATE]", state);
      try {
        if (!state) {
          return;
        }

        const { name, payload }: LoginStateInfo = state;
        switch (name) {
          case "ACCESS_WEBSHOP":
            track({
              name: "view_webshop",
              payload: {
                webshopUrl: payload.redirectUrl,
                source: "redirect_after_login",
                gameId: payload.gameClientId,
              },
            });
            void navigate({
              to: "/shop",
              search: { gameWebshopUrl: payload.redirectUrl },
              replace: true,
            });
            break;
          case "DOWNLOAD_GAME":
            void navigate({
              to: "/games/$gameClientId",
              params: {
                gameClientId: payload.gameClientId,
              },
              search: {
                triggerState: "AutoOpenDownloadDialog",
              },
              replace: true,
            });
            break;
          case "PLAY_WEB_GAME":
            track({
              name: "init_start_play_game",
              payload: {
                gameId: payload.gameClientId,
                source: "redirect_after_login",
              },
            });
            void navigate({
              to: "/webgame/$gameClientId",
              params: {
                gameClientId: payload.gameClientId,
              },
              replace: true,
            });
            break;
          case "PLAY_NATIVE_GAME":
            track({
              name: "init_start_play_game",
              payload: {
                gameId: payload.gameClientId,
                source: "redirect_after_login",
              },
            });
            void navigate({
              to: "/games/$gameClientId",
              params: {
                gameClientId: payload.gameClientId,
              },
              search: {
                triggerState: "AutoStartNativeGameAfterLogin",
              },
              replace: true,
            });
            break;
          case "NORMAL_LOGIN":
          default:
            void navigate({
              to: "/",
            });
        }
      } catch (_) {
        void navigate({
          to: "/",
        });
      }
    },
    [clientLogger, track, navigate],
  );

  return { handleNavigateFromLoginState };
};

const UserSettingDropdownMenu = ({
  vgaUser,
  guestId,
}: {
  vgaUser: VgaUser;
  guestId: string;
}): JSX.Element => {
  const { t } = useTranslation();
  const { track } = useTracking();
  const {
    location: { pathname },
  } = useRouterState();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { onFocusAppNavBar } = useWebviewArranger();
  const changeDropDown = (open): void => {
    setIsDropdownOpen(open);
    onFocusAppNavBar(open);
  };
  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={changeDropDown}>
      <HoverSidebarItemWrapper content={vgaUser ? vgaUser.displayName : t("sideBar.login")}>
        <DropdownMenuTrigger asChild>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg">
            <Avatar className="h-6 w-6">
              <AvatarImage src={vgaUser.avatar} alt="" />
              <AvatarFallback>
                <UserIcon className="h-5 w-5" strokeWidth={2.5} />
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
      </HoverSidebarItemWrapper>

      <DropdownMenuContent className="w-56 bg-neutral-800" align="end" side="right">
        <DropdownMenuItem
          className="flex h-10 cursor-pointer items-center focus:bg-neutral-600"
          onClick={() => {
            track({
              name: "click_avatar",
              payload: { guestId },
            });
            void navigate({ to: "/account" });
          }}
        >
          <UserIcon className="mr-2 h-5 w-5" strokeWidth={2.5} />
          <span className="body-14-regular">{t("actions.manageAccount")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex h-10 cursor-pointer items-center focus:bg-neutral-600"
          onClick={() => {
            window.api.user_logout();
            track({
              name: "logout",
              payload: {},
            });
            if (pathname === "/account" || pathname === "/shop") {
              void navigate({ to: "/" });
            }
            toast.success(t("success.logOut"));
          }}
        >
          <LogOut className="mr-2 h-5 w-5" strokeWidth={2.5} />
          <span className="body-14-regular">{t("actions.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
const LoginButton = (): JSX.Element => {
  const { isValidatingUserSession, setUserSession, vgaUser, setVgaUser, setLauncherUser, guestId } =
    useSessionProvider();
  const { track } = useTracking();
  const { handleNavigateFromLoginState } = useHandleNavigateFromLoginState();
  const { t } = useTranslation();
  useLayoutEffect(() => {
    const listener: IpcRendererListener = (
      _,
      { session, vgaUser, state, launcherUser }: UpdateUserSessionParams,
    ) => {
      setUserSession(session);
      setVgaUser(vgaUser);
      setLauncherUser(launcherUser);
      if (launcherUser && vgaUser && session && state) {
        // if state doesn't exists it might just be an open app event
        // state only exists when user just logged in
        track({
          name: "login",
          payload: {
            territory: vgaUser.territory,
            loginChannel: vgaUser.sessionClientInfo.signInMethod,
            vga_id: launcherUser.signInId,
            launcher_user_id: launcherUser.userId,
          },
        });
        handleNavigateFromLoginState(state);
      }
    };
    return window.api.app_addListener(FROM_NODE_UPDATE_USER_SESSION, listener);
  }, [setVgaUser, setUserSession, setLauncherUser, track, handleNavigateFromLoginState]);

  if (vgaUser) return <UserSettingDropdownMenu vgaUser={vgaUser} guestId={guestId} />;

  return (
    <HoverSidebarItemWrapper content={t("sideBar.login")}>
      <Link to="/login" className="[&.active]:font-bold" disabled={isValidatingUserSession}>
        <Button
          variant="ghost"
          className="h-12 w-12 p-0 hover:bg-neutral-800"
          onClick={() => {}}
          disabled={isValidatingUserSession}
        >
          <img src={userIcon} className="h-6 w-6" />
        </Button>
      </Link>
    </HoverSidebarItemWrapper>
  );
};

export default LoginButton;
