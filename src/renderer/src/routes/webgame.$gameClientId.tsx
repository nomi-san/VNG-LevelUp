import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect, useMemo } from "react";

import { gameQueryOptions } from "@renderer/apis/gameQueryOptions";
import LoadingComponent from "@renderer/components/LoadingComponent";
import { useLanguageProvider } from "@renderer/providers/LanguageProvider";
import { useSessionProvider } from "@renderer/providers/SessionProvider";

import { type ShowEmbeddedGameArgs } from "@src/const/events";

export const Route = createFileRoute("/webgame/$gameClientId")({
  loader: ({
    context: {
      queryClient,
      session: { guestId, launcherUser },
      language,
    },
    params: { gameClientId },
  }) => {
    return queryClient.ensureQueryData(
      gameQueryOptions({
        language,
        guestId,
        userId: launcherUser?.userId,
        gameClientId,
      }),
    );
  },
  component: WebGame,
});

function WebGame(): JSX.Element {
  const gameClientId = Route.useParams().gameClientId;
  const { language } = useLanguageProvider();
  const { vgaUser, guestId, userSession, launcherUser } = useSessionProvider();
  const { data: game } = useSuspenseQuery(
    gameQueryOptions({
      language,
      guestId,
      userId: launcherUser?.userId,
      gameClientId,
    }),
  );
  const eventArgs: ShowEmbeddedGameArgs = useMemo(() => {
    return {
      clientId: game.id,
      link: game.downloadUrl,
      token: userSession,
      user: vgaUser,
    };
  }, [game, userSession, vgaUser]);

  useLayoutEffect(() => {
    if (!game) return;

    window.api.webGame_mount(eventArgs);
    return (): void => {
      window.api.webGame_unmount();
    };
  }, [game, eventArgs]);

  if (!game) return <div>Game not found</div>;
  return <LoadingComponent />;
}
