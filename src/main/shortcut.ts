import { writeFile } from "fs";
import path from "path";
import { app, ipcMain, type WebContentsView } from "electron";

import {
  FROM_NODE_SELECT_GAME_ON_LIST_AND_START_GAME_SHORTCUT,
  FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG,
  FROM_RENDERER_CREATE_DESKTOP_SHORTCUT,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import type { CommonEventParams } from "@src/types/common";
import type { DetailsPageGameInfo } from "@src/types/game";

import { GAME_TRIGGER_URI, SEARCH_PARAM_GAME_TRIGGER_URI } from "./const/auth";
import launcherStore from "./store";

export const handleShortcut = () => {
  ipcMain.on(
    FROM_RENDERER_CREATE_DESKTOP_SHORTCUT,
    async (_, { id, title }: DetailsPageGameInfo) => {
      const gameInfo = launcherStore.getGameInfo(id);
      if (!gameInfo) return;

      createShortcut({
        title: title,
        gameId: id,
        iconPath: gameInfo.runnablePath,
      });
    },
  );
};

export const handlePlayGameOnOpenApp = (
  appContentView: WebContentsView,
): { handlePlayGameFromProcessArgv: (argv: string[]) => void } => {
  const handlePlayGameFromProcessArgv = (argv: string[]) => {
    try {
      if (!argv.at(-1)?.startsWith(GAME_TRIGGER_URI)) return;

      const deepLinkUrl = argv.at(-1) || "";
      if (deepLinkUrl) {
        const temp = new URL(deepLinkUrl);
        const gameToPlay = temp.searchParams.get(SEARCH_PARAM_GAME_TRIGGER_URI);

        if (!gameToPlay || typeof gameToPlay !== "string") return;

        const params: CommonEventParams = { clientId: gameToPlay };
        const localGameInfo = launcherStore.getGameInfo(gameToPlay);
        if (!localGameInfo) {
          appContentView.webContents.send(
            FROM_NODE_SELECT_GAME_ON_LIST_AND_TRIGGER_DOWNLOAD_DIALOG,
            params,
          );
          return;
        }

        appContentView.webContents.send(
          FROM_NODE_SELECT_GAME_ON_LIST_AND_START_GAME_SHORTCUT,
          params,
        );
      }
    } catch (error) {
      nodeLogger.error(error, "[DEEP LINK SHORTCUT ERROR]");
    }
  };

  return { handlePlayGameFromProcessArgv };
};

const convertPath = (path: string): string => {
  return path.replace(/\\/g, "+AFw-").replace(/ế/g, "+Hr8-");
};
const convertPath2 = (path: string): string => {
  return path.replace(/ế/g, "?");
};

export const makeShortcutPath = (title: string): string => {
  return path.join(app.getPath("desktop"), `${title}.url`);
};
export function createShortcut({
  gameId,
  title,
  iconPath,
}: {
  gameId: string;
  title: string;
  iconPath: string;
}): void {
  const filePath = makeShortcutPath(title);
  const content = `[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0
[InternetShortcut]
IDList=
IconIndex=0
URL=${GAME_TRIGGER_URI}/?${SEARCH_PARAM_GAME_TRIGGER_URI}=${gameId}
IconFile=${convertPath2(iconPath)}
HotKey=0
[InternetShortcut.A]
IconFile=${convertPath2(iconPath)}
[InternetShortcut.W]
IconFile=${convertPath(iconPath)}
`;

  writeFile(filePath, content, (err) => {
    if (err) {
      nodeLogger.error(err, "Error writing shortcut:");
    } else {
      console.log(`File created successfully at ${filePath}`);
    }
  });
}
