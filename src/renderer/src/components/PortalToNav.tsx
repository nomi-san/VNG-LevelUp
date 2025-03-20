import { Portal } from "react-portal";
import type { ReactNode } from "react";

import FadeInFromY from "@renderer/animations/FadeInFromY";

export const NAV_PORTAL_ID = "portal-to-nav";
type Portals = "shop" | "play";
const enableAnimation = true;
export const makePortalId = (gameId: string, portal: Portals): string => {
  if (enableAnimation) return `${NAV_PORTAL_ID}-${gameId}-${portal}`;
  return NAV_PORTAL_ID;
};

export const PortalToNav = ({
  children,
  gameId,
  portal,
}: {
  children: React.ReactNode;
  gameId: string;
  portal: Portals;
}): ReactNode => {
  return (
    <Portal node={document && document.getElementById(makePortalId(gameId, portal))}>
      {children}
    </Portal>
  );
};
export const PortalToNavAnimated = ({
  children,
  shouldUsePortal,
  gameId,
  portal,
}: {
  children: React.ReactNode;
  shouldUsePortal: boolean;
  gameId: string;
  portal: Portals;
}): ReactNode => {
  if (!shouldUsePortal) return null;

  return (
    <Portal node={document && document.getElementById(makePortalId(gameId, portal))}>
      <FadeInFromY>{children}</FadeInFromY>
    </Portal>
  );
};

export const NavPortal = ({ id, className }: { id: string; className?: string }): JSX.Element => {
  return (
    <div className={className}>
      <div id={makePortalId(id, "play")}></div>
      <div id={makePortalId(id, "shop")}></div>
    </div>
  );
};
