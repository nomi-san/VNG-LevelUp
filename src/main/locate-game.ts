import path from "path";
import { app, ipcMain } from "electron";
import { promisified as regedit, setExternalVBSLocation } from "regedit";

import { FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES } from "@src/const/events";
import launcherStore from "@src/main/store";
import { makeDeepLinkName } from "@src/main/utils/deeplink";
import type { DetailsPageGameInfo, LocalGameInternalVersion } from "@src/types/game";

const registryKeyAppPaths = "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths";

const handleLocateGame = (): void => {
  setExternalVBSLocation("resources/regedit/vbs");

  ipcMain.handle(
    FROM_RENDERER_LOCATE_PREV_INSTALLED_GAMES,
    async (_, remoteGameInfo: DetailsPageGameInfo): Promise<string> => {
      const gameExecutableName = `${remoteGameInfo.title}.exe`;
      const gameRegistryKey = path.join(registryKeyAppPaths, gameExecutableName);

      //console.log("gameRegistryKey", gameRegistryKey);
      const listResult2 = await regedit.list([gameRegistryKey]);

      //console.log("listResult2", listResult2);
      const gamePath: string =
        typeof listResult2[gameRegistryKey].values[""]?.value === "string"
          ? listResult2[gameRegistryKey].values[""]?.value
          : "";

      //console.log("gamePath", gamePath);
      if (!gamePath) return "";

      const legacyVersion: LocalGameInternalVersion = "legacy";
      const rootFolderPath = gamePath.endsWith(remoteGameInfo.runnablePath)
        ? gamePath.slice(0, -remoteGameInfo.runnablePath.length)
        : gamePath;

      //console.log("rootFolderPath", rootFolderPath);
      launcherStore.setGameInfo(remoteGameInfo.id, {
        runnablePath: gamePath,
        rootFolderPath,
        internalVersion: legacyVersion,
      });

      app.setAsDefaultProtocolClient(makeDeepLinkName(remoteGameInfo.id), gamePath);

      return gamePath;
    },
  );
};

export default handleLocateGame;
