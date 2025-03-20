import { useMutation } from "@tanstack/react-query";
import { useLayoutEffect } from "react";

import { makeRequestOnRenderer } from "@renderer/apis/shared";
import useToast from "@renderer/hooks/useToast";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import { type BaseFetchError } from "@src/const/error";
import { FROM_NODE_MAKE_REQUEST } from "@src/const/events";
import type { RequestFromNodeToRenderer, SerializableParams } from "@src/types/request";

import { CustomToasterAction } from "./components/ui/sonner";

const NodeRequestMaker = () => {
  const { language } = useLanguageProvider();
  const { launcherUser, guestId, userSession } = useSessionProvider();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { mutate } = useMutation({
    mutationFn: ({ request, overrideSession }: RequestFromNodeToRenderer<SerializableParams>) => {
      return makeRequestOnRenderer({
        ...request,
        params: {
          ...request.params,
          session: overrideSession || userSession,
          guestId: guestId,
          userId: launcherUser?.userId,
          language,
        },
      });
    },
    onError: (error: BaseFetchError, variables) => {
      toast.error(t(`error.${error.code}.title`) + ` (${error.message})`, {
        description: t(`error.${error.code}.subTitle`),
        action: (
          <CustomToasterAction
            label={t("actions.copy")}
            onClick={() => {
              void navigator.clipboard.writeText(error.requestId);
            }}
            altText={t("actions.copy")}
            variant="error"
          />
        ),
      });

      //TODO: Fix types for this, there should not be data here
      window.api.system_forwardResultToNode({
        requestId: variables.requestId,
        error: error,
        data: null,
      });
    },
    onSuccess: (data, variables) => {
      window.api.system_forwardResultToNode({
        requestId: variables.requestId,
        data: data,
      });
    },
  });

  useLayoutEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_MAKE_REQUEST,
      (_, variables: RequestFromNodeToRenderer<SerializableParams>) => {
        mutate(variables);
      },
    );
  }, [mutate]);

  return <></>;
};

export default NodeRequestMaker;
