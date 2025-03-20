import React, { useCallback, useEffect, useState, type PropsWithChildren } from "react";

import useIsUnmountedRef from "@renderer/hooks/useIsUnmounted";

import { FROM_NODE_UPDATE_IS_VALIDATING_SESSION } from "@src/const/events";
import type { UserSessionInfo } from "@src/types/system";
import type { LauncherUser, VgaUser } from "@src/types/user";

interface SessionType {
  userSession: string;
  setUserSession: (session: string) => void;
  vgaUser: VgaUser | null;
  launcherUser: LauncherUser | null;
  setVgaUser: (user: VgaUser) => void;
  setLauncherUser: (launcherUser: LauncherUser | null) => void;
  guestId: string;
  isValidatingUserSession: boolean;
}
const SessionContext = React.createContext<SessionType>(null as unknown as SessionType);

export const SessionProvider = ({
  children,
  session,
  isValidatingSession: _isValidatingSession,
  guestId,
}: PropsWithChildren<UserSessionInfo>) => {
  const [userSession, setUserSession] = useState<string>(session);
  const [launcherUser, setLauncherUser] = useState<LauncherUser | null>(null);
  const [vgaUser, setVgaUser] = React.useState<VgaUser | null>(null);
  const [isValidatingUserSession, setIsValidatingUserSession] = useState(_isValidatingSession);
  const setLauncherUserWrapper = useCallback((user: LauncherUser | null) => {
    setLauncherUser(user);
  }, []);

  const contextValue: SessionType = React.useMemo(
    () => ({
      userSession,
      vgaUser,
      launcherUser,
      setUserSession,
      setVgaUser,
      setLauncherUser: setLauncherUserWrapper,
      guestId,
      isValidatingUserSession,
    }),
    [userSession, vgaUser, launcherUser, setLauncherUserWrapper, guestId, isValidatingUserSession],
  );

  const isUnmounted = useIsUnmountedRef();

  useEffect(() => {
    if (isUnmounted.current) return;

    void window.api.store_getUserSession().then(({ isValidatingSession }) => {
      setIsValidatingUserSession(isValidatingSession);
    });

    return window.api.app_addListener(
      FROM_NODE_UPDATE_IS_VALIDATING_SESSION,
      (_event, isValidatingSession) => {
        setIsValidatingUserSession(isValidatingSession);
      },
    );
  }, [isUnmounted]);

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};

export const useSessionProvider = (): SessionType => {
  const contextValue = React.useContext(SessionContext);

  return contextValue;
};
