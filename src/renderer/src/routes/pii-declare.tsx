import { createFileRoute, useRouter, type SearchSchemaInput } from "@tanstack/react-router";
import { useEffect, useLayoutEffect } from "react";

import fullLogoNoBg from "@renderer/assets/full-logo-no-bg.svg";
import { Button } from "@renderer/components/ui/button";
import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { useTranslation } from "@renderer/i18n/useTranslation";

import { FROM_NODE_PII_DECLARE_SUCCESSFULLY } from "@src/const/events";

type PiiDeclareSearch = {
  piiUrl: string;
};
export const Route = createFileRoute("/pii-declare")({
  component: PiiDeclare,
  validateSearch: (search: Record<string, unknown> & SearchSchemaInput): PiiDeclareSearch => {
    return {
      piiUrl: search.piiUrl as string | "",
    };
  },
});

function PiiDeclare(): JSX.Element {
  const { piiUrl } = Route.useSearch();
  const isUnmounted = useIsUnmountedRef();
  const { t } = useTranslation();
  const { history } = useRouter();

  useLayoutEffect(() => {
    if (!piiUrl) return;
    if (isUnmounted.current) return;

    if (!piiUrl) {
      history.go(-1);
      return;
    }
    window.api.app_openExternalWeb(piiUrl);
  }, [piiUrl, history, isUnmounted]);

  useEffect(() => {
    return window.api.app_addListener(FROM_NODE_PII_DECLARE_SUCCESSFULLY, () => {
      history.go(-1);
    });
  }, [history]);

  if (!piiUrl) return <></>;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <img src={fullLogoNoBg} alt={t("altLauncherLogoImg")} className="mb-5 h-6"></img>
      <p className="heading-4 mb-1 text-center">{t("pii.page.title")}</p>
      <p className="body-14-regular mb-4 text-neutral-300">{t("pii.page.description")}</p>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          window.api.app_openExternalWeb(piiUrl);
        }}
      >
        {t("actions.retry")}
      </Button>
    </div>
  );
}
