import { ipcMain } from "electron/main";

import {
  FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE,
  FROM_RENDERER_REDEEM_CODE,
  FROM_RENDERER_USER_PLAY_GAME_TO_REDEEM,
} from "@src/const/events";
import launcherStore from "@src/main/store";
import type { CommonEventParams } from "@src/types/common";
import type { LocalRedeemCodeInfo, SetRedeemCodeInfo } from "@src/types/redeem";

const handleRedeemCode = (): void => {
  ipcMain.handle(
    FROM_RENDERER_GET_USER_HAS_REDEEMED_CODE,
    (_, { clientId }: CommonEventParams): LocalRedeemCodeInfo => {
      const userHasRedeemedCode = launcherStore.getCachedUserHasRedeemedCode();
      const info = userHasRedeemedCode[clientId];

      if (!info)
        return {
          redeemedAt: "not_played_game_yet",
          code: "",
        };

      return userHasRedeemedCode[clientId];
    },
  );

  ipcMain.handle(FROM_RENDERER_REDEEM_CODE, (_, params: SetRedeemCodeInfo): void => {
    const userHasRedeemedCode = launcherStore.getCachedUserHasRedeemedCode();
    const info = userHasRedeemedCode[params.gameClientId];

    if (info && info.code) {
      return;
    }

    launcherStore.setCachedUserHasRedeemedCode(params.gameClientId, params.code);
  });

  ipcMain.handle(
    FROM_RENDERER_USER_PLAY_GAME_TO_REDEEM,
    (_, { clientId }: CommonEventParams): void => {
      const localRedeemInfo = launcherStore.getCachedUserHasRedeemedCode();
      const info = localRedeemInfo[clientId];

      const userHasRedeemedCode = info && info.redeemedAt !== "not_redeemed";
      if (userHasRedeemedCode) return;

      launcherStore.setCachedUserHasRedeemedCode(clientId, "");
    },
  );
};

export default handleRedeemCode;
