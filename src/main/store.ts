import { existsSync } from "node:fs";
import { join } from "node:path";
import { app, safeStorage, type DownloadItem } from "electron";
import type ElectronStore from "electron-store";
import Store from "electron-store";
import { v7 as uuidv7 } from "uuid";

import nodeLogger from "@src/logger/serverLogger";
import type { CloseWindowSetting, NotificationPermission } from "@src/types/app-settings";

import type {
  Deprecated_LocalGameInfo,
  Deprecated_LocalGameInfoV2,
  GameClientId,
  LocalGameInfoV3,
} from "../types/game";
import type { LocalRedeemCodeInfo } from "../types/redeem";
import { getParentFolderOfAFile, moveFile } from "./utils-dir";

const generateUUID = (): string => {
  return uuidv7();
};

interface StoreSchema {
  guestId: string;
  games: Record<GameClientId, Deprecated_LocalGameInfoV2>;
  userSession: string;
  defaultGameDir: string;
  downloadItemsMap: Map<GameClientId, DownloadItem>;
  openTime: number;
  closeSetting: CloseWindowSetting;
  notificationPermission: NotificationPermission;
}

const store: ElectronStore<StoreSchema> = new Store<StoreSchema>();

const isLocalGameInfo = (
  info: Deprecated_LocalGameInfo | Deprecated_LocalGameInfoV2,
): info is Deprecated_LocalGameInfo => {
  return (info as Deprecated_LocalGameInfo).path !== undefined;
};
const isLocalGameInfoV2 = (
  info: Deprecated_LocalGameInfo | Deprecated_LocalGameInfoV2,
): info is Deprecated_LocalGameInfoV2 => {
  return (info as Deprecated_LocalGameInfoV2).runnablePath !== undefined;
};

const isLocalGameInfoV3 = (
  info: Deprecated_LocalGameInfo | Deprecated_LocalGameInfoV2 | LocalGameInfoV3,
): info is LocalGameInfoV3 => {
  return (info as LocalGameInfoV3).internalVersion !== undefined;
};

// All games released before V3 will have this version
const DEFAULT_INTERNAL_VERSION = 1;

export class LauncherStore {
  _onClearUserSession: () => void = () => {};
  _onUpdateUserSession: (session: string) => void = () => {};
  constructor() {
    const appDataFolder = app.getPath("appData");
    const oldNexusConfigFile = join(appDataFolder, "Nexus", "config.json");
    const oldLevelUpConfigFile = join(appDataFolder, "LevelUp", "config.json");

    const newLevelUpConfigFile = join(app.getPath("userData"), "config.json");

    if (existsSync(oldNexusConfigFile)) {
      void moveFile(oldNexusConfigFile, newLevelUpConfigFile);
      nodeLogger.log("migrated old Nexus config file to new file");
    }
    if (existsSync(oldLevelUpConfigFile)) {
      void moveFile(oldLevelUpConfigFile, newLevelUpConfigFile);
      nodeLogger.log("migrated old LevelUp config file to new file");
    }
  }

  setOnClearUserSession(callback: () => void): void {
    this._onClearUserSession = callback;
  }
  setOnUpdateUserSession(callback: (session: string) => void): void {
    this._onUpdateUserSession = callback;
  }

  isEncryptionAvailable(): boolean {
    return safeStorage.isEncryptionAvailable();
  }
  getGameInfo(clientId: GameClientId): LocalGameInfoV3 | null {
    const gameInfo: Deprecated_LocalGameInfo | Deprecated_LocalGameInfoV2 | LocalGameInfoV3 | null =
      store.get(`games.${clientId}`) || null;

    if (!gameInfo) return null;

    if (isLocalGameInfoV3(gameInfo)) return gameInfo;

    if (isLocalGameInfoV2(gameInfo)) {
      this.setGameInfo(clientId, {
        runnablePath: gameInfo.runnablePath,
        rootFolderPath: gameInfo.rootFolderPath,
        internalVersion: DEFAULT_INTERNAL_VERSION,
      });

      return this.getGameInfo(clientId);
    }

    if (isLocalGameInfo(gameInfo)) {
      this.setGameInfo(clientId, {
        runnablePath: gameInfo.path,
        rootFolderPath: getParentFolderOfAFile(gameInfo.path), // Should work for all of our games for now, doesn't work with MLB
        internalVersion: DEFAULT_INTERNAL_VERSION,
      });

      return this.getGameInfo(clientId);
    }

    return null;
  }
  setGameInfo(clientId: GameClientId, info: LocalGameInfoV3): void {
    store.set(`games.${clientId}`, info);
  }
  clearGameInfo(clientId: GameClientId): void {
    //@ts-expect-error it should work
    store.delete(`games.${clientId}`);
  }

  getAmountOfGameSessionsPlayed(): number {
    return store.get("amountOfGameSessions", 0);
  }
  increaseAmountOfGameSessionsPlayed(): number {
    const result = this.getAmountOfGameSessionsPlayed() + 1;

    store.set("amountOfGameSessions", result);
    return result;
  }

  getUserSession(): string {
    const encryptedUserSession = store.get("userSession");
    if (!encryptedUserSession) return "";
    try {
      const userSession = safeStorage.decryptString(Buffer.from(encryptedUserSession, "base64"));

      return userSession;
    } catch (error) {
      // If this happens, maybe someone is trying to hack the user session by modifying the encrypted string
      nodeLogger.error(error, "error decrypting user session");
    }

    return "";
  }
  setUserSession(session: string): void {
    const previousSession = launcherStore.getUserSession();

    if (!session) {
      store.set("userSession", "");

      if (previousSession !== "") {
        this._onClearUserSession();
      }
      return;
    }

    nodeLogger.debug("[SET USER SESSION]", session);
    const buffer = safeStorage.encryptString(session);

    store.set("userSession", buffer.toString("base64"));

    if (previousSession !== session) {
      this._onUpdateUserSession(session);
    }
  }

  getGuestId(): string {
    if (!store.has("guestId")) {
      store.set("guestId", generateUUID());
    }

    return store.get("guestId");
  }

  getDefaultGameDir(): string {
    const gameDir = store.get("defaultGameDir");
    if (!gameDir) {
      store.set("defaultGameDir", app.getPath("home"));
    }

    return store.get("defaultGameDir");
  }
  setDefaultGameDir(dir: string): void {
    store.set("defaultGameDir", dir);
  }

  setAppOpenTime(): void {
    store.set("openTime", Date.now());
  }
  getAppOpenTime(): number {
    return store.get("openTime");
  }

  getAmountOfGameSessionsPlayedBeforeCompletetingLocalSurvey(): number {
    return store.get("didSurveyAtNthGameSession", 0);
  }
  setAmountOfGameSessionPlayedBeforeCompletingLocalSurvey(): void {
    const n = store.get("amountOfGameSessions", 0);
    store.set("didSurveyAtNthGameSession", n);
  }

  getCachedUserHasRedeemedCode(): Record<GameClientId, LocalRedeemCodeInfo> {
    return store.get("cached_UserHasRedeemedCode", {});
  }
  setCachedUserHasRedeemedCode(gameClientId: GameClientId, code: string): void {
    const n = store.get("cached_UserHasRedeemedCode", {});

    const info: LocalRedeemCodeInfo = {
      code,
      redeemedAt: code ? Date.now() : "not_redeemed",
    };
    n[gameClientId] = info;
    store.set("cached_UserHasRedeemedCode", n);
  }

  setCloseSetting(setting: CloseWindowSetting): void {
    store.set("closeSetting", setting);
  }

  getCloseSetting(): CloseWindowSetting {
    const setting = store.get("closeSetting");
    if (setting === "MINIMIZE_TO_TRAY" || setting == "EXIT_LAUNCHER") {
      return setting;
    }
    store.set("closeSetting", "MINIMIZE_TO_TRAY");
    return "MINIMIZE_TO_TRAY";
  }

  setNotificationPermission(permission: NotificationPermission): void {
    store.set("notificationPermission", permission);
  }

  getNotificationPermission(): NotificationPermission {
    const permission = store.get("notificationPermission");
    if (permission === "GRANTED" || permission == "DENIED") {
      return permission;
    }
    store.set("notificationPermission", "GRANTED");
    return "GRANTED";
  }

  setHasMinimizeToTrayNoti(): void {
    store.set("hasMinimizeToTrayNoti", true);
  }
  getHasMinimizeToTrayNoti(): boolean {
    return store.get("hasMinimizeToTrayNoti", false);
  }
  getAllGameIds(): GameClientId[] {
    return Object.keys(store.get("games") || {}).map((key) => key as GameClientId) || [];
  }
}

const launcherStore = new LauncherStore();

export default launcherStore;
