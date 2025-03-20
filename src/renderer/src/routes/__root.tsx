import { type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  getRouterContext,
  Outlet,
  useMatch,
  useMatches,
  useNavigate,
} from "@tanstack/react-router";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import cloneDeep from "lodash/cloneDeep";
import { WifiOff } from "lucide-react";
import { Trans } from "react-i18next";
import {
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
} from "react";

import { useTracking } from "@renderer/analytics";
import { NavPortal } from "@renderer/components/PortalToNav";
import { useSetUpGameStartSubscriber } from "@renderer/hooks/useGameStateSubscribers";
import useOnlineStatus from "@renderer/hooks/useOnlineStatus";
import { useTranslation } from "@renderer/i18n/useTranslation";
import { ForceLoginProvider } from "@renderer/providers/ForceLoginProvider";
import type { useSessionProvider } from "@renderer/providers/SessionProvider";
import AppUpdateMenu from "@renderer/routes/-components/AppUpdate";
import HomeButtons from "@renderer/routes/-components/HomeButton";
import ReportButtons from "@renderer/routes/-components/ReportButtons";
import WindowButtons from "@renderer/routes/-components/WindowsButton";

import {
  FROM_NODE_FORCE_NAVIGATE_TO_HOME,
  FROM_NODE_ON_START_NATIVE_GAME,
  FROM_NODE_ON_STOP_NATIVE_GAME,
} from "@src/const/events";
import type { SupportedLanguage } from "@src/const/language";
import type { OnStartStopGameParams } from "@src/types/native-game";

import { WarnBeforeQuitDialog } from "./-components/download/WarnBeforeQuit";
import { SideBar } from "./-components/sidebar/SideBar";

// There's a case where the app shows "Not Found" on open production build
const NotFoundComponent = (): string => {
  const navigate = useNavigate();

  useLayoutEffect(() => {
    void navigate({ to: "/" });
  }, [navigate]);

  return "";
};

const ConnectionStatusBar = (): JSX.Element => {
  const isOnlineStatus = useOnlineStatus();
  const { t } = useTranslation();
  return isOnlineStatus ? (
    <></>
  ) : (
    <p className="body-14-regular fixed left-0 right-0 top-14 z-40 flex items-center justify-center bg-red-700 px-5 py-3 text-neutral-50 opacity-50">
      <WifiOff className="mr-3" />
      <Trans i18nKey="connectionStatus.failed" t={t} />
    </p>
  );
};

const windowDraggableStyle: CSSProperties = {
  //@ts-expect-error allow for dragging windows
  WebkitAppRegion: "drag",
} as const;
const windowNonDraggableStyle: CSSProperties = {
  //@ts-expect-error allow for dragging windows
  WebkitAppRegion: "no-drag",
};

const AnimatedOutlet = forwardRef<HTMLDivElement, { nextMatchId: string }>(
  ({ nextMatchId }, ref) => {
    const RouterContext = getRouterContext();

    const routerContext = useContext(RouterContext);

    const renderedContext = useRef(routerContext);

    const isPresent = useIsPresent();

    if (isPresent) {
      renderedContext.current = cloneDeep(routerContext);
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "linear" }}
      >
        <RouterContext.Provider value={renderedContext.current}>
          <Navigation id={nextMatchId} />
          <ConnectionStatusBar />
          <Outlet />
        </RouterContext.Provider>
      </motion.div>
    );
  },
);
AnimatedOutlet.displayName = "AnimatedOutlet";

const RootOutlet = (): JSX.Element => {
  const matches = useMatches();
  const match = useMatch({ strict: false });
  const nextMatchIndex = matches.findIndex((d) => d.id === match.id) + 1;
  const nextMatch = matches[nextMatchIndex];

  const id =
    nextMatch.pathname === "/account" ||
    nextMatch.pathname === "/shop" ||
    nextMatch.pathname === "/login"
      ? ""
      : nextMatch.params.gameClientId || nextMatch.pathname;

  if (!id) return <AnimatedOutlet key={id} nextMatchId={id} />;
  return (
    <AnimatePresence mode="popLayout">
      <AnimatedOutlet key={id} nextMatchId={id} />
    </AnimatePresence>
  );
};

const Navigation = ({ id }: { id: string }): JSX.Element => {
  const navigate = useNavigate();
  useLayoutEffect(() => {
    return window.api.app_addListener(FROM_NODE_FORCE_NAVIGATE_TO_HOME, () => {
      void navigate({ to: "/" });
    });
  }, [navigate]);
  return (
    <nav
      className="relative z-50 flex max-h-14 w-full justify-between bg-none px-5 py-4"
      style={windowDraggableStyle}
    >
      <div className="ml-14 flex items-center gap-2" style={windowNonDraggableStyle}>
        <HomeButtons />
      </div>
      <div className="flex items-center gap-4" style={windowNonDraggableStyle}>
        <AppUpdateMenu />
        <WarnBeforeQuitDialog />
        <NavPortal className="flex flex-row-reverse items-center gap-3" id={id} />
        <div className="flex items-center gap-3">
          <ReportButtons />
          <WindowButtons />
        </div>
      </div>
    </nav>
  );
};

const GameSessionTracker = (): JSX.Element => {
  const { track } = useTracking();

  useEffect(() => {
    const unsubscribeGameStart = window.api.app_addListener(
      FROM_NODE_ON_START_NATIVE_GAME,
      (_, params: OnStartStopGameParams) => {
        track({
          name: "start_game_session",
          payload: {
            gameId: params.clientId,
            sessionId: params.sessionId,
          },
        });
      },
    );
    const unsubscribeGameTerminate = window.api.app_addListener(
      FROM_NODE_ON_STOP_NATIVE_GAME,
      (_, params: OnStartStopGameParams) => {
        track({
          name: "end_game_session",
          payload: {
            gameId: params.clientId,
            sessionId: params.sessionId,
          },
        });
      },
    );

    return (): void => {
      unsubscribeGameStart();
      unsubscribeGameTerminate();
    };
  }, [track]);

  return <></>;
};
const RootRoute = (): JSX.Element => {
  useSetUpGameStartSubscriber();
  return (
    <>
      <GameSessionTracker />
      <ForceLoginProvider>
        <SideBar />
        <main>
          {/*<Navigation id={NAV_PORTAL_ID} />
          <Outlet /> */}
          <RootOutlet />
        </main>
      </ForceLoginProvider>
    </>
  );
};

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  session: ReturnType<typeof useSessionProvider>;
  language: SupportedLanguage;
}>()({
  component: () => <RootRoute />,
  notFoundComponent: () => <NotFoundComponent />,
});
