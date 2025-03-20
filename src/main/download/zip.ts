import path from "path";
import type { Readable } from "stream";
import { type WebContentsView } from "electron";
import fs from "fs-extra";
import yauzl from "yauzl";

import nodeLogger from "@src/logger/serverLogger";
import { createEmptyUnzipProgress } from "@src/main/download/const";
import { type GameDownloadEntry } from "@src/main/download/map";
import { updateProgressOnRenderer } from "@src/main/download/utils";
import { checkIfFileExists, getParentFolderOfAFile } from "@src/main/utils-dir";
import type { InstallStatus, UnzipProgress } from "@src/types/system";

export async function extractZipAndReportProgress({
  currentDownload,
  downloadItemIndex,
  appContentView,
  itemSavePath,
  updateInstallStatus: updateInstallStatus,
}: {
  currentDownload: GameDownloadEntry;
  downloadItemIndex: number;
  appContentView: WebContentsView;
  itemSavePath: string;
  updateInstallStatus: (installStatus: InstallStatus, unzipProgress: UnzipProgress) => void;
}): Promise<UnzipProgress | null> {
  const [zipResult, errorExtract] = await extractZipFile(itemSavePath, (unzipProgress) => {
    currentDownload.progress[downloadItemIndex].download.status = "completed";
    updateInstallStatus("Unziping", unzipProgress);

    updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
  });
  if (!zipResult) {
    nodeLogger.error(errorExtract, "Error while extracting zip");
    const unzipProgress = createEmptyUnzipProgress(
      currentDownload.initInfo.gameUpdateInfo.resources[downloadItemIndex],
    );

    if (errorExtract?.message.includes("ENOSPC")) {
      unzipProgress.interruptReason = "notEnoughSpaceForUnzip";
    }
    updateInstallStatus("Unzip Failed", unzipProgress);
    updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);

    return null;
  }

  updateInstallStatus("Unzip Success", zipResult);
  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
  nodeLogger.log("Extraction complete!");

  const gameFile = path.join(
    currentDownload.initInfo.properties.directory,
    currentDownload.initInfo.remoteGameInfo.runnablePath,
  );
  const [__, errorFileDoesntExist] = await checkIfFileExists(gameFile);

  if (errorFileDoesntExist) {
    updateInstallStatus("Invalid File", zipResult);
    updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);
    return null;
  }

  updateInstallStatus("Valid File", zipResult);
  updateProgressOnRenderer(appContentView, currentDownload, downloadItemIndex);

  return zipResult;
}

type TryCatchResult<TResult = boolean, TError = unknown> = [TResult, null] | [false, TError];
const extractZipFile = async (
  zipFile: string,
  onUpdate: (update: UnzipProgress) => void,
): Promise<TryCatchResult<UnzipProgress | null, Error>> => {
  try {
    const result = await extractZip(zipFile, onUpdate);
    nodeLogger.log("Extraction complete!");

    return [result, null];
  } catch (error) {
    nodeLogger.error(error, "Error while extracting zip");
    return [false, error as Error];
  }
};

const handleUnzipFailed = (
  zipfile: yauzl.ZipFile | null,
  readStream: Readable | null,
  writeStream: fs.WriteStream | null,
  reject: (reason?: Error) => void,
  err: Error,
): void => {
  process.noAsar = false;

  if (zipfile) {
    nodeLogger.log("Closing zip file");
    zipfile.close(); // Close the ZIP file
  }

  if (readStream) {
    nodeLogger.log("Closing read stream");
    readStream.destroy(); // Destroy read stream if it's open
  }

  if (writeStream) {
    nodeLogger.log("Closing write stream");
    writeStream.destroy(); // Destroy write stream if it's open
  }

  nodeLogger.error(err, "Error extracting ZIP file");

  reject(err);
};

export function extractZip(
  zipFilePath: string,
  onUpdate: (params: UnzipProgress) => void,
): Promise<UnzipProgress> {
  return new Promise((resolve, reject) => {
    let result: UnzipProgress = {
      totalBytes: 0,
      unzippedBytes: 0,
      percent: 0,
    };
    process.noAsar = true;

    let extractedZipFileSize = 0;
    const outputDir = getParentFolderOfAFile(zipFilePath);
    nodeLogger.debug("Unzipping", zipFilePath);

    try {
      yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err || !zipfile) {
          handleUnzipFailed(null, null, null, reject, err || new Error("Failed to open ZIP"));
          return;
        }

        const zipFileSize = zipfile.fileSize;

        zipfile.readEntry();

        zipfile.on("entry", (entry) => {
          const filePath = path.join(outputDir, entry.fileName);

          if (/\/$/.test(entry.fileName)) {
            fs.ensureDir(filePath, (err) => {
              if (err) {
                handleUnzipFailed(zipfile, null, null, reject, err);
                return;
              }
              zipfile.readEntry();
            });
          } else {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err || !readStream) {
                handleUnzipFailed(
                  zipfile,
                  null,
                  null,
                  reject,
                  err || new Error("Failed to open read stream"),
                );
                return;
              }

              extractedZipFileSize += entry.compressedSize;

              fs.ensureDir(path.dirname(filePath), (err) => {
                if (err) {
                  handleUnzipFailed(zipfile, readStream, null, reject, err);
                  return;
                }

                const writeStream = fs.createWriteStream(filePath);
                readStream.pipe(writeStream);

                writeStream.on("finish", () => {
                  result = {
                    percent: (extractedZipFileSize / zipFileSize) * 100,
                    totalBytes: zipFileSize,
                    unzippedBytes: extractedZipFileSize,
                  };
                  onUpdate(result);

                  const lastModified = new Date(entry.getLastModDate());
                  try {
                    fs.utimesSync(filePath, lastModified, lastModified);
                  } catch (error) {
                    nodeLogger.error(error, "Unable to set file timestamp");
                  }

                  readStream.destroy();
                  writeStream.destroy();
                  zipfile.readEntry();
                });

                writeStream.on("error", (err) => {
                  handleUnzipFailed(zipfile, readStream, writeStream, reject, err);
                });
              });

              readStream.on("error", (err) => {
                handleUnzipFailed(zipfile, readStream, null, reject, err);
              });
            });
          }
        });

        zipfile.on("end", () => {
          process.noAsar = false;
          zipfile.close(); // Ensure ZIP file is closed on success
          nodeLogger.debug("Extraction complete!");
          resolve(result);
        });

        zipfile.on("error", (err) => {
          handleUnzipFailed(zipfile, null, null, reject, err);
        });
      });
    } catch (error) {
      process.noAsar = false;
      if (error instanceof Error) {
        handleUnzipFailed(null, null, null, reject, error);
      }
    }
  });
}
