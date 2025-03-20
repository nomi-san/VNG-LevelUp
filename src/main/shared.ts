import nodeLogger from "@src/logger/serverLogger";
import type { BuildLoginInfo } from "@src/types/auth";

interface GlobalData {
  loginInfo?: BuildLoginInfo;
}

const globalData: GlobalData = {};

export function getGlobalLoginInfo(): GlobalData["loginInfo"] {
  return globalData.loginInfo;
}

export function updateGlobalLoginInfo(newLoginInfo: GlobalData["loginInfo"]): void {
  nodeLogger.log("[UPDATE GlobalData]", globalData);
  globalData.loginInfo = newLoginInfo;
}
