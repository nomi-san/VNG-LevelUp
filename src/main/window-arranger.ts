import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { BrowserWindow, ipcMain, shell, WebContentsView } from "electron";

import { FROM_RENDERER_FOCUS_WEBVIEW } from "@src/const/events";
import nodeLogger from "@src/logger/serverLogger";
import { APP_DIMENTIONS, NAVBAR_HEIGHT } from "@src/main/const/ui";
import { envNode } from "@src/main/env-node";
import type { FocusWebView } from "@src/types/system";

import icon from "../../resources/icon.ico?asset";
import { handleAccount } from "./account";
import { BG_TRANSPARENT } from "./const";
import { handleWebShop } from "./web-shop";

const matchWebViewWithWindowDimention = (
  mainWindow: BrowserWindow,
  webView: WebContentsView,
): void => {
  webView.setBounds({
    x: 0,
    y: 0,
    width: mainWindow.getContentBounds().width,
    height: mainWindow.getContentBounds().height,
  });
};

const matchWebViewWithContentDimention = (
  mainWindow: BrowserWindow,
  webView: WebContentsView,
): void => {
  webView.setBounds({
    x: 0,
    y: NAVBAR_HEIGHT,
    width: mainWindow.getContentBounds().width,
    height: mainWindow.getContentBounds().height - NAVBAR_HEIGHT,
  });
};

export function createWindow(): {
  mainWindow: BrowserWindow;
  appContentView: WebContentsView;
  webShopView: WebContentsView;
  accountView: WebContentsView;
  renderApp: () => Promise<void>;
} {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: APP_DIMENTIONS.width,
    height: APP_DIMENTIONS.height,
    backgroundColor: "#22252a",
    show: true,
    autoHideMenuBar: true,
    titleBarStyle: "hidden",
    resizable: false,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      devTools: envNode.isInAutoTestEnvironment ? false : is.dev,
    },
    darkTheme: true,
  });

  const appContentView = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      devTools: envNode.isInAutoTestEnvironment ? false : is.dev,
    },
  });
  appContentView.setBackgroundColor(BG_TRANSPARENT);

  matchWebViewWithWindowDimention(mainWindow, appContentView);
  mainWindow.on("resize", () => {
    matchWebViewWithWindowDimention(mainWindow, appContentView);
  });

  const renderApp = async (): Promise<void> => {
    appContentView.webContents.openDevTools();
    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
      await appContentView.webContents.loadURL(process.env["ELECTRON_RENDERER_URL"]);
    } else {
      await appContentView.webContents.loadFile(join(__dirname, "../renderer/index.html"));
    }
  };

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url);
    return { action: "deny" };
  });
  const webShopView = new WebContentsView();
  matchWebViewWithContentDimention(mainWindow, webShopView);
  mainWindow.on("resize", () => {
    matchWebViewWithContentDimention(mainWindow, webShopView);
  });
  const accountView = new WebContentsView();
  matchWebViewWithContentDimention(mainWindow, accountView);
  mainWindow.on("resize", () => {
    matchWebViewWithContentDimention(mainWindow, accountView);
  });

  handleWebShop({
    appContentView,
    webShopView,
    onMount: () =>
      arrange({
        mainWindow,
        appContentView,
        webShopView,
        accountView,
        action: "mountWebshop",
      }),
    onUnmount: () =>
      arrange({
        mainWindow,
        appContentView,
        webShopView,
        accountView,
        action: "unmountWebshop",
      }),
  });
  handleAccount({
    appContentView,
    accountView,
    onMount: () =>
      arrange({
        mainWindow,
        appContentView,
        webShopView,
        accountView,
        action: "mountAccount",
      }),
    onUnmount: () =>
      arrange({
        mainWindow,
        appContentView,
        webShopView,
        accountView,
        action: "unmountAccount",
      }),
  });

  ipcMain.handle(FROM_RENDERER_FOCUS_WEBVIEW, (_, { action }: FocusWebView) => {
    arrange({ mainWindow, appContentView, webShopView, accountView, action });
  });

  mainWindow.contentView.addChildView(appContentView);

  return { mainWindow, appContentView, webShopView, accountView, renderApp };
}

let currentView: "appContent" | "webShop" | "account" = "appContent";
const arrange = ({
  mainWindow,
  appContentView,
  webShopView,
  action,
  accountView,
}: {
  mainWindow: BrowserWindow;
  appContentView: WebContentsView;
  webShopView: WebContentsView;
  accountView: WebContentsView;
  action:
    | "mountWebshop"
    | "mountAccount"
    | "unmountWebshop"
    | "unmountAccount"
    | "focusAppMenu"
    | "unfocusAppMenu";
}): void => {
  nodeLogger.debug("arrange", action, currentView);
  switch (action) {
    case "mountWebshop":
      // matchWebViewWithNavbarDimention(mainWindow, appContentView);
      mainWindow.contentView.addChildView(appContentView);

      // matchWebViewWithContentDimention(mainWindow, webShopView);
      mainWindow.contentView.addChildView(webShopView);
      currentView = "webShop";
      break;
    case "unmountWebshop":
      mainWindow.contentView.removeChildView(webShopView);
      // matchWebViewWithWindowDimention(mainWindow, appContentView);
      currentView = "appContent";
      break;

    case "mountAccount":
      // matchWebViewWithNavbarDimention(mainWindow, appContentView);
      mainWindow.contentView.addChildView(appContentView);

      // matchWebViewWithContentDimention(mainWindow, accountView);
      mainWindow.contentView.addChildView(accountView);
      currentView = "account";
      break;
    case "unmountAccount":
      accountView.webContents.clearHistory();
      mainWindow.contentView.removeChildView(accountView);
      // matchWebViewWithWindowDimention(mainWindow, appContentView);
      mainWindow.contentView.addChildView(appContentView);
      currentView = "appContent";
      break;

    case "focusAppMenu":
      // matchWebViewWithWindowDimention(mainWindow, appContentView);
      mainWindow.contentView.addChildView(appContentView);
      break;

    case "unfocusAppMenu":
      if (currentView === "appContent") break;
      // matchWebViewWithNavbarDimention(mainWindow, appContentView);
      mainWindow.contentView.addChildView(appContentView);

      if (currentView === "webShop") {
        // matchWebViewWithContentDimention(mainWindow, webShopView);
        mainWindow.contentView.addChildView(webShopView);
      }
      if (currentView === "account") {
        // matchWebViewWithContentDimention(mainWindow, accountView);
        mainWindow.contentView.addChildView(accountView);
      }
      break;
  }

  nodeLogger.debug("finish arrange", action, currentView);
};
