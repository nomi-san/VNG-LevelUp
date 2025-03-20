import { SessionProvider, useSessionProvider } from "@renderer/providers/SessionProvider";

import "./assets/base.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHashHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { StrictMode, useEffect, useState } from "react";

import { Toaster } from "@renderer/components/ui/sonner";

import { routeTree } from "../../routeTree.gen";
import { DownloadProgressProvider, DownloadQueueProvider } from "./providers/DownloadProvider";

import "@renderer/i18n/i18n";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";
import { initMonitoringRenderer } from "@renderer/utils/monitoring";

import {
  FROM_NODE_SELECT_GAME_ON_LIST_AND_START_GAME_SHORTCUT,
  FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG,
} from "@src/const/events";
import type { CommonEventParams } from "@src/types/common";

import { initTracking, useTracking } from "./analytics";
import { initApisForWebMode, isRunningWebMode } from "./mode/web";
import NodeRequestMaker from "./NodeRequestMaker";
import { AppConfigProvider } from "./providers/AppConfigProvider";
import { AppUpdateProvider } from "./providers/AppUpdateProvider";
import { ClientLoggerProvider } from "./providers/ClientLoggerProvider";
import { LanguageProvider, useLanguageProvider } from "./providers/LanguageProvider";
import { SurveyProvider } from "./providers/SurveyProvider";

initMonitoringRenderer();
window.api
  .analytics_getInfoForAnalytics()
  .then((info) => {
    if (info) {
      initTracking(info);
    }
  })
  .catch((e) => {
    console.error("Failed to get analytics info", e);
  });

if (isRunningWebMode) initApisForWebMode();

const queryClient = new QueryClient();
const hashHistory = createHashHistory();
const router = createRouter({
  routeTree,
  // For react query
  context: {
    queryClient,
    session: undefined!,
    language: undefined!,
  },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  history: hashHistory,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
const App = (): JSX.Element => {
  const session = useSessionProvider();
  const { language } = useLanguageProvider();

  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG,
      (_, params: CommonEventParams) => {
        void router.navigate({
          to: "/games/$gameClientId",
          params: { gameClientId: params.clientId },
          search: { triggerState: "AutoOpenDownloadDialog" },
        });
      },
    );
  }, []);

  useEffect(() => {
    return window.api.app_addListener(
      FROM_NODE_SELECT_GAME_ON_LIST_AND_START_GAME_SHORTCUT,
      (_, params: CommonEventParams) => {
        void router.navigate({
          to: "/games/$gameClientId",
          params: { gameClientId: params.clientId },
          search: {
            triggerState: "AutoStartNativeGameOnOpenShortcut",
          },
        });
      },
    );
  }, []);

  return <RouterProvider router={router} context={{ queryClient, session, language }} />;
};
const OpenAppTracker = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const { track } = useTracking();

  const isUnmounted = useIsUnmountedRef();
  const { isValidatingUserSession } = useSessionProvider();
  const [finishedTheFirstSessionValidation, setFinishedTheFirstSessionValidation] = useState(false);

  useEffect(() => {
    if (isUnmounted.current) return;

    if (!isValidatingUserSession) {
      setFinishedTheFirstSessionValidation(true);
    }
  }, [isUnmounted, finishedTheFirstSessionValidation, isValidatingUserSession]);

  useEffect(() => {
    if (isUnmounted.current) return;
    if (finishedTheFirstSessionValidation) {
      void window.api.analytics_getInfoForAnalytics().then((info) => {
        track({
          name: "open_app",
          payload: {
            app_version: info.appVersion,
            app_open_time: info.appOpenTime,
            platform: info.platform,
          },
        });
      });
    }
  }, [isUnmounted, finishedTheFirstSessionValidation]);

  return children;
};

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  void window.api.store_getUserSession().then(({ session, isValidatingSession, guestId }) => {
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <SessionProvider
            session={session}
            isValidatingSession={isValidatingSession}
            guestId={guestId}
          >
            <OpenAppTracker>
              <ClientLoggerProvider>
                <LanguageProvider>
                  <AppConfigProvider>
                    <Toaster />
                    <NodeRequestMaker />

                    <AppUpdateProvider>
                      <SurveyProvider>
                        <DownloadQueueProvider>
                          <DownloadProgressProvider>
                            <App />
                          </DownloadProgressProvider>
                        </DownloadQueueProvider>
                      </SurveyProvider>
                    </AppUpdateProvider>
                  </AppConfigProvider>
                </LanguageProvider>
              </ClientLoggerProvider>
            </OpenAppTracker>
          </SessionProvider>
        </QueryClientProvider>
      </StrictMode>,
    );
  });
}
