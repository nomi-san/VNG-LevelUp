import { ipcMain, WebContentsView, type BrowserWindow } from "electron";

import {
  FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_MOUNT,
  FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_UNMOUNT,
  type ShowEmbeddedGameArgs,
} from "@src/const/events";
import { APP_DIMENTIONS, NAVBAR_HEIGHT } from "@src/main/const/ui";

export const handleEmbeddedWebGame = (mainWindow: BrowserWindow): void => {
  const embeddedWebGameView = new WebContentsView();
  let isEmbeddedWebGameShown = false;

  ipcMain.on(
    FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_MOUNT,
    (_, { user, link }: ShowEmbeddedGameArgs) => {
      if (isEmbeddedWebGameShown) return;
      isEmbeddedWebGameShown = true;

      void embeddedWebGameView.webContents.loadURL(link).then(() => {
        mainWindow.setBounds({
          height: APP_DIMENTIONS.height,
          width: 430,
        });
        embeddedWebGameView.setBounds({
          x: 0,
          y: NAVBAR_HEIGHT,
          width: mainWindow.getContentBounds().width,
          height: mainWindow.getContentBounds().height,
        });

        mainWindow.contentView.addChildView(embeddedWebGameView);
        //embeddedWebGameView.webContents.openDevTools();
        setTimeout(() => {
          void embeddedWebGameView.webContents.executeJavaScript(
            `document.getElementsByTagName('h1')[0].innerText = 'Welcome, ${user?.displayName}'`,
          );
        }, 1000);
      });
    },
  );
  ipcMain.on(FROM_RENDERER_PAGE_EMBEDDED_WEB_GAME_UNMOUNT, () => {
    isEmbeddedWebGameShown = false;
    mainWindow.contentView.removeChildView(embeddedWebGameView);
    mainWindow.setBounds({
      height: APP_DIMENTIONS.height,
      width: APP_DIMENTIONS.width,
    });
  });
};
