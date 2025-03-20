import { Link } from "@tanstack/react-router";
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import { useTracking } from "@renderer/analytics";
import { Button } from "@renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@renderer/components/ui/dialog";
import useWebviewArranger from "@renderer/hooks/useWebviewArranger";
import { useTranslation } from "@renderer/i18n/useTranslation";

import type {
  AccessWebshopAction,
  ForceLoginResult,
  LoginStateTriggerForceLogin,
  PlayNativeGameAction,
  PlayWebGameAction,
} from "@src/types/auth";
import type { ProductAuthType, WebshopAuthType } from "@src/types/game";

import { useSessionProvider } from "./SessionProvider";

const ForceLoginDialog = ({
  loginStateInfo,
  hideDialog,
}: {
  loginStateInfo: LoginStateTriggerForceLogin;
  hideDialog: (value: ForceLoginResult) => void;
}): JSX.Element => {
  const { t } = useTranslation();
  const { track } = useTracking();

  return (
    <Dialog open onOpenChange={() => hideDialog("can-not-continue")}>
      <DialogContent className="w-[450px] rounded-xl bg-neutral-800">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <div className="!mb-6">
            <div className="mb-5 flex flex-col items-center justify-center">
              <img
                src="https://cdn-nexus.vnggames.com/assets/images/common/login-dialog.svg"
                alt={"Login Dialog"}
                className="h-56 w-56"
              />
            </div>
            <p className="heading-4 mb-2">{t("login.dialog.title")}</p>
            <p className="body-14-regular text-neutral-300">
              {t("login.dialog.description.canNotSkip")}
            </p>
          </div>

          <DialogDescription></DialogDescription>
          <DialogFooter className="flex-row justify-end">
            <Link
              className="[&.active]:font-bold"
              to="/login"
              search={{
                extendedStateInfo: loginStateInfo,
              }}
            >
              <Button
                type="button"
                variant="white"
                size="lg"
                className="!font-bold uppercase"
                onClick={() => {
                  track({
                    name:
                      loginStateInfo.name === "PLAY_WEB_GAME"
                        ? "accept_force_login_on_play_game"
                        : "accept_force_login_on_webshop",
                    payload: {
                      gameId: loginStateInfo.payload.gameClientId,
                    },
                  });
                  hideDialog("can-not-continue");
                }}
              >
                {t("actions.login")}
              </Button>
            </Link>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const ForceLoginContext = createContext<{
  triggerForceLoginPlayGame: (
    loginState: PlayNativeGameAction | PlayWebGameAction,
    authType: ProductAuthType,
  ) => Promise<ForceLoginResult>;
  triggerForceLoginWebshop: (
    loginState: AccessWebshopAction,
    authType: WebshopAuthType,
  ) => Promise<ForceLoginResult>;
}>({
  triggerForceLoginPlayGame: async () => {
    return "can-not-continue";
  },
  triggerForceLoginWebshop: async () => {
    return "can-not-continue";
  },
});

export const ForceLoginProvider = ({ children }: PropsWithChildren<object>): JSX.Element => {
  const { userSession } = useSessionProvider();
  const [loginState, setLoginState] = useState<LoginStateTriggerForceLogin | null>(null);
  const [authType, setAuthType] = useState<ProductAuthType | WebshopAuthType | null>(null);
  const [resolvePromise, setResolvePromise] = useState<{
    resolve: (value: "can-continue" | "can-not-continue") => void;
  }>({ resolve: () => {} });
  const { onFocusAppNavBar } = useWebviewArranger();

  const contextValue = useMemo(() => {
    const triggerForceLogin = async (
      loginState: LoginStateTriggerForceLogin,
      authType: ProductAuthType | WebshopAuthType,
    ): Promise<ForceLoginResult> => {
      setLoginState(loginState);
      setAuthType(authType);
      onFocusAppNavBar(true);

      return new Promise((resolve) => {
        setResolvePromise({
          resolve: (value: ForceLoginResult): void => {
            setLoginState(null);
            setAuthType(null);

            resolve(value);
          },
        });
      });
    };
    return {
      triggerForceLoginPlayGame: async (
        loginState: PlayNativeGameAction | PlayWebGameAction,
        authType: ProductAuthType,
      ): Promise<ForceLoginResult> => {
        if (userSession) return "can-continue";
        if (authType === "none" || authType === "signin") return "can-continue";

        return triggerForceLogin(loginState, authType);
      },

      triggerForceLoginWebshop: async (
        loginState: AccessWebshopAction,
        authType: WebshopAuthType,
      ): Promise<ForceLoginResult> => {
        if (userSession) return "can-continue";
        if (authType === "sinrd") return "can-continue";

        return triggerForceLogin(loginState, authType);
      },
    };
  }, [userSession, setLoginState, setAuthType, setResolvePromise, onFocusAppNavBar]);

  return (
    <ForceLoginContext.Provider value={contextValue}>
      {loginState && authType && (
        <ForceLoginDialog
          loginStateInfo={loginState}
          hideDialog={(value: "can-not-continue" | "can-continue") => {
            setLoginState(null);
            resolvePromise.resolve(value);
          }}
        />
      )}
      {children}
    </ForceLoginContext.Provider>
  );
};

export const useForceLoginProvider = () => {
  const contextValue = useContext(ForceLoginContext);

  return contextValue;
};
