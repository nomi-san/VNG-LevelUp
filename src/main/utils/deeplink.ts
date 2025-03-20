export const makeDeepLinkName = (clientId: string): string => `vng-game-launch-${clientId}`;
export const makeDeepLink = (clientId: string, token?: string): string => {
  const defaultDeeplink = `vng-game-launch-${clientId}://`;
  if (!token) return defaultDeeplink;

  return `${defaultDeeplink}?token=${token}`;
};
