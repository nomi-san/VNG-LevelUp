import { createFileRoute, useRouter, type SearchSchemaInput } from "@tanstack/react-router";
import { useLayoutEffect } from "react";

import fullLogoNoBg from "@renderer/assets/full-logo-no-bg.svg";
import { Button } from "@renderer/components/ui/button";
import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import type { LoginStateInfo, NormalLogin } from "@src/types/auth";

type LoginSearch = {
  extendedStateInfo: LoginStateInfo;
};
export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput): LoginSearch => {
    const defaultLoginState: NormalLogin = {
      name: "NORMAL_LOGIN",
      payload: {},
    };
    return {
      extendedStateInfo:
        (search.extendedStateInfo as LoginStateInfo | undefined) || defaultLoginState,
    };
  },
});

function Login(): JSX.Element {
  const { extendedStateInfo } = Route.useSearch();
  const { isValidatingUserSession, userSession } = useSessionProvider();
  const { t } = useTranslation();
  const { history } = useRouter();
  const isUnmounted = useIsUnmountedRef();

  useLayoutEffect(() => {
    if (isUnmounted.current) return;

    if (isValidatingUserSession) return;
    if (userSession) {
      history.go(-1);
      return;
    }
    const params: LoginStateInfo = extendedStateInfo;

    void window.api.renderLoginPage(params);
  }, [extendedStateInfo, history, isValidatingUserSession, userSession, isUnmounted]);

  if (userSession) return <></>;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <img src={fullLogoNoBg} alt={t("altLauncherLogoImg")} className="mb-5 h-6"></img>
      <p className="heading-4 mb-4 max-w-96 text-center">{t("login.transition.description")}</p>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          void window.api.renderLoginPage(extendedStateInfo);
        }}
        disabled={isValidatingUserSession}
      >
        {t("actions.retry")}
      </Button>
    </div>
  );
}
