import type { LocalGameInfoV3, LocalGameInternalVersion } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

export const gameIsInstalled = (
  localGameInfo: LocalGameInfoV3 | null,
): localGameInfo is LocalGameInfoV3 => localGameInfo !== null;

export const shouldUpdateGame = (
  localGameVersion: LocalGameInternalVersion,
  gameUpdateInfo: GameUpdateInfo,
): boolean => {
  if (localGameVersion === "legacy") return false;
  if (gameUpdateInfo.resources.length === 0) return false;

  return true;
};
