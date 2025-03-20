import fs from "fs";
import { join } from "node:path";
import { app, ipcMain } from "electron";

import { FROM_RENDERER_SEND_LOG } from "@src/const/events";

import { removeFile } from "./utils-dir";

const LOG_DIRECTORY_NAME = "launcher-logs";
const LOG_TTL = 7 * 24 * 60 * 60 * 1000; // a week

const getLogFolderPath = (): string => {
  return join(app.getPath("userData"), LOG_DIRECTORY_NAME);
};

const getLogFileName = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `nexus-log-${year}-${month}-${day}.log`;
};

const createIfNotExistedLogFolder = (): void => {
  const logFolderPath = getLogFolderPath();
  if (!fs.existsSync(logFolderPath)) {
    fs.mkdirSync(logFolderPath, { recursive: true });
  }
};

export const writeLog = (message: string): void => {
  const logFilePath = join(getLogFolderPath(), getLogFileName());
  fs.appendFile(logFilePath, message + "\n", () => {});
};

const deleteOldLogs = (): void => {
  const logFolderPath = getLogFolderPath();
  fs.readdir(logFolderPath, (err, files) => {
    if (err) {
      return;
    }

    const allowedTime = Date.now() - LOG_TTL;

    files.forEach((file) => {
      const filePath = join(logFolderPath, file);
      const fileDateMatch = file.match(/nexus-log-(\d{4})-(\d{2})-(\d{2})\.log/);

      if (fileDateMatch) {
        const fileDate = new Date(`${fileDateMatch[1]}-${fileDateMatch[2]}-${fileDateMatch[3]}`);

        if (fileDate.getTime() < allowedTime) {
          void removeFile(filePath);
        }
      }
    });
  });
};

export const handleFileLogger = (): void => {
  createIfNotExistedLogFolder();
  deleteOldLogs();
  ipcMain.on(FROM_RENDERER_SEND_LOG, (_, message: string) => {
    if (message && message.length > 0) {
      writeLog(message);
    }
  });
};
