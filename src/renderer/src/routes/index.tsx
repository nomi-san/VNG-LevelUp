import { useQueryErrorResetBoundary, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { useTracking } from "@renderer/analytics";
import { gamesQueryOptions } from "@renderer/apis/gamesQueryOptions";
import ErrorComponent from "@renderer/components/ErrorComponent";
import HomeSkeleton from "@renderer/components/skeleton/HomeSkeleton";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import type { TriggerState } from "@src/types/auth";
import type { GameClientId, ListPageGameInfo } from "@src/types/game";

import HomeNew from "./-components/HomeNew";

type HomeSearch = {
  gameClientId?: GameClientId;
  triggerState?: TriggerState;
};
export const Route = createFileRoute("/")({
  loader: ({
    context: {
      session: { guestId, launcherUser },
      language,
    },
  }) => gamesQueryOptions({ language, guestId, userId: launcherUser?.userId }),
  errorComponent: HomeErrorComponent,
  pendingComponent: HomeSkeleton,
  component: Home,

  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    return {
      triggerState: search.triggerState as TriggerState,
      gameClientId: search.gameClientId as string,
    };
  },
});
function HomeErrorComponent({ error }: ErrorComponentProps): JSX.Element {
  const router = useRouter();
  const queryErrorResetBoundary = useQueryErrorResetBoundary();
  useEffect(() => {
    queryErrorResetBoundary.reset();
  }, [queryErrorResetBoundary]);
  return (
    <ErrorComponent
      error={error}
      onRetry={() => {
        void router.invalidate();
      }}
    />
  );
}

const emptyGames: ListPageGameInfo[] = [];
function Home(): JSX.Element {
  const { language } = useLanguageProvider();
  const { launcherUser, guestId } = useSessionProvider();
  const { data } = useSuspenseQuery(
    gamesQueryOptions({ language, guestId, userId: launcherUser?.userId }),
  );
  const games = data?.items || emptyGames;

  const navigate = useNavigate();
  const { track } = useTracking();

  return (
    <HomeNew
      games={games}
      onClickGame={(gameId) => {
        track({ name: "click_game_item", payload: { gameId } });
        void navigate({
          to: "/games/$gameClientId",
          params: { gameClientId: gameId },
        });
      }}
    />
  );
}
