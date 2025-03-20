import { ipcMain, type WebContentsView } from "electron";

import {
  FROM_NODE_PAGE_SHOP_UPDATE_NAVIGATION,
  FROM_RENDERER_PAGE_SHOP_BACK,
  FROM_RENDERER_PAGE_SHOP_FORWARD,
  FROM_RENDERER_PAGE_SHOP_MOUNT,
  FROM_RENDERER_PAGE_SHOP_UNMOUNT,
} from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import type { CanGo, ShopMountParams } from "@src/types/window-arranger";

import { restrictOpenWindowHandler } from "./utils";

export const handleWebShop = ({
  appContentView,
  webShopView,
  onMount,
  onUnmount,
}: {
  appContentView: WebContentsView;
  webShopView: WebContentsView;

  onMount: () => void;
  onUnmount: () => void;
}): WebContentsView => {
  restrictOpenWindowHandler(webShopView.webContents);
  let currentUrl = "";

  ipcMain.on(FROM_RENDERER_PAGE_SHOP_MOUNT, async (_, params: ShopMountParams) => {
    const url = webShopView.webContents.getURL();

    const shopIsShowingAnotherGame = url !== "about:blank";
    if (shopIsShowingAnotherGame) await webShopView.webContents.loadURL("about:blank");
    onMount();

    currentUrl = params.gameWebshopUrl;

    webShopView.webContents
      .loadURL(params.gameWebshopUrl)
      .then(() => {
        nodeLogger.debug("webshop loaded");
      })
      .catch((error) => {
        nodeLogger.error(error, "web shop error");
      });
    //webShopView.webContents.openDevTools();
  });

  ipcMain.on(FROM_RENDERER_PAGE_SHOP_UNMOUNT, () => {
    currentUrl = "";
    onUnmount();
  });

  ipcMain.handle(FROM_RENDERER_PAGE_SHOP_BACK, () => {
    if (webShopView.webContents.getURL() === currentUrl) return "should-unmount";

    webShopView.webContents.goBack();

    return undefined;
  });

  ipcMain.handle(FROM_RENDERER_PAGE_SHOP_FORWARD, () => {
    webShopView.webContents.goForward();
  });

  webShopView.webContents.on("did-navigate-in-page", async () => {
    const canGo: CanGo = {
      back: webShopView.webContents.canGoBack(),
      forward: webShopView.webContents.canGoForward(),
    };

    appContentView.webContents.send(FROM_NODE_PAGE_SHOP_UPDATE_NAVIGATION, canGo);
  });

  return webShopView;
};
