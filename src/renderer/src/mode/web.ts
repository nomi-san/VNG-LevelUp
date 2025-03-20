/* eslint-disable @typescript-eslint/explicit-function-return-type */

import type { GameClientId, LocalGameInfoV3 } from "@src/types/game";

export const isRunningWebMode = !window.api;

const noOpAsync = async (): Promise<void> => {};
const noOpAsyncReturnString = async (): Promise<"mock"> => "mock";
const noOpAsyncReturnArray = async (): Promise<[]> => [];
const mockLocalGame: LocalGameInfoV3 = {
  runnablePath: "mockPath",
  rootFolderPath: "mockPath",
  internalVersion: 1,
};
export const initApisForWebMode = () => {
  window.api = {
    selectFolder: async () => {
      return {
        selectedDir: "mockPath",
        availableStorage: {
          totalFreeSpace: 100,
          diskSpaceAvailableForUser: 100,
        },
      };
    },
    store_getGameInfo: (gameClientId: GameClientId) =>
      Promise.resolve(
        gameClientId === "bomber1"
          ? mockLocalGame
          : { runnablePath: "", rootFolderPath: "", internalVersion: 1 },
      ),
    store_mutateGameInfo: noOpAsync,
    store_clearGameInfo: noOpAsync,
    store_getDefaultGameDir: async () => {
      return {
        selectedDir: "mockPath",
        availableStorage: {
          totalFreeSpace: 100,
          diskSpaceAvailableForUser: 100,
        },
      };
    },
    store_getGuestId: noOpAsyncReturnString,
    store_setDefaultGameDir: noOpAsyncReturnString,
    registerDeepLink: noOpAsync,
    renderLoginPage: noOpAsync,
    download_getAllDownloads: noOpAsyncReturnArray,
    //@ts-expect-error just a mock
    download_getDownloadProgress: () => {
      return {
        initInfo: {},
        progress: {},
      };
    },
    app_getVersion: noOpAsyncReturnString,
  };
};
