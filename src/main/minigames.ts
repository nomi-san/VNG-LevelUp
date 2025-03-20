import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { BrowserWindow, ipcMain, WebContentsView } from "electron";

import { FROM_RENDERER_GET_MINIGAMES, FROM_RENDERER_PLAY_MINIGAME } from "@src/const/events";
import { APP_DIMENTIONS } from "@src/main/const/ui";
import type { Minigame } from "@src/types/minigames";

import { envNode } from "./env-node";

const mockMinigames: Minigame[] = [
  {
    id: "1",
    name: "Game 1",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    name: "Game 2",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    name: "Game 3",
    imageUrl: "https://via.placeholder.com/150",
  },
  {
    id: "4",
    name: "Game 4",
    imageUrl: "https://via.placeholder.com/150",
  },
];
const handleMinigames = (): void => {
  ipcMain.handle(FROM_RENDERER_GET_MINIGAMES, async (): Promise<Minigame[]> => {
    return mockMinigames;
  });

  ipcMain.on(FROM_RENDERER_PLAY_MINIGAME, () => {
    const miniGamesWindow = new BrowserWindow({
      width: APP_DIMENTIONS.width,
      height: APP_DIMENTIONS.height,
      backgroundColor: "#22252a",
      show: true,
      autoHideMenuBar: true,
      resizable: false,
      webPreferences: {
        preload: join(__dirname, "../preload/index.mjs"),
        sandbox: false,
        devTools: is.dev,
      },
      darkTheme: true,
      title: "Nexus Minigames",
    });
    const miniGamesContentView = new WebContentsView({
      webPreferences: {
        preload: join(__dirname, "../preload/index.mjs"),
        sandbox: false,
        devTools: is.dev,
      },
    });
    miniGamesContentView.setBounds({
      x: 0,
      y: 0,
      width: miniGamesWindow.getContentBounds().width,
      height: miniGamesWindow.getContentBounds().height,
    });
    miniGamesContentView.setBackgroundColor("#22252A");
    void miniGamesContentView.webContents.loadURL(`https://${envNode.minigames}`);

    miniGamesWindow.contentView.addChildView(miniGamesContentView);
  });
};

export default handleMinigames;
