import path from "path";

import type { DownloadProgressInfo } from "@src/types/system";

const GAME_PATCH_INSTALL_FOLDER = ".levelup-patch";
const GAME_PATH_INSTALL_FOLDER = ".levelup-patch-content";
const GAME_METADATA_FILE_NAME = ".levelup-patch.metadata.json";

export const makePatchFolder = (initInfo: DownloadProgressInfo["initInfo"]) => {
  const patchFolder = path.join(initInfo.properties.directory, GAME_PATCH_INSTALL_FOLDER);

  return patchFolder;
};

export const makePatchContentFolder = (initInfo: DownloadProgressInfo["initInfo"]) => {
  const patchFolder = makePatchFolder(initInfo);
  const contentFolder = path.join(patchFolder, GAME_PATH_INSTALL_FOLDER);
  return contentFolder;
};

export const makePatchMetadataFile = (initInfo: DownloadProgressInfo["initInfo"]) => {
  const patchFolder = makePatchFolder(initInfo);
  const patchMetadataFile = path.join(patchFolder, GAME_METADATA_FILE_NAME);
  return patchMetadataFile;
};

type Checksum = string;
type RelativePath = string;

export type DiffObjectV2 = {
  added: {
    [key: RelativePath]: Checksum;
  };
  removed: {
    [key: RelativePath]: Checksum;
  };
};
