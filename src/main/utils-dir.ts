import { createHash } from "crypto";
import { constants, readFileSync } from "fs";
import { access, chmod, rename, stat, utimes } from "fs/promises";
import { dirname } from "node:path";
import fs from "fs-extra";
import { rimraf } from "rimraf";

import nodeLogger from "@src/logger/serverLogger";

export const removeFolder = async (path: string): Promise<boolean> => {
  nodeLogger.log("Removing path", { path });
  try {
    await rimraf(path, {});
    return true;
  } catch (error) {
    nodeLogger.error(error, "Failed to remove path");
    return false;
  }
};

export const removeFile = async (path: string): Promise<boolean> => {
  nodeLogger.log("Removing file", { path });
  return removeFolder(path);
};

export const getParentFolderOfAFile = (filePath: string): string => {
  return dirname(filePath);
};

type TryCatchResult<TResult = boolean, TError = unknown> = [TResult, TError | null];
export const checkIfFileExists = async (
  gameFile: string,
): Promise<TryCatchResult<boolean, unknown>> => {
  try {
    await access(gameFile, constants.F_OK);

    return [true, null];
  } catch (error) {
    nodeLogger.debug(`${gameFile} does not exist`);
    return [false, error];
  }
};

export const renameFile = async (oldPath: string, newPath: string): Promise<void> => {
  return rename(oldPath, newPath);
};

export const moveFile = async (oldPath: string, newPath: string): Promise<void> => {
  try {
    const stats = await stat(oldPath);
    const parentFolder = getParentFolderOfAFile(newPath);
    if (!fs.existsSync(parentFolder)) {
      await fs.mkdir(parentFolder, { recursive: true });
    }
    await rename(oldPath, newPath);

    await chmod(newPath, stats.mode);

    await utimes(newPath, stats.atime, stats.mtime);
  } catch (error) {
    nodeLogger.error(error, "error while moving file");
  }
};

export const validateFileHash = (filePath: string, fileHash: string): boolean => {
  const hash = createHash("sha256").update(readFileSync(filePath)).digest("hex");

  return hash === fileHash;
};
