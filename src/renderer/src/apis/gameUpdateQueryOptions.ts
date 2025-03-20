import { queryOptions } from "@tanstack/react-query";

import type { DetailsPageGameInfo, GameClientId, LocalGameInternalVersion } from "@src/types/game";
import type { GameUpdateInfo } from "@src/types/game-update";

import { fetchGameUpdate } from "./gameUpdate";
import type { ApiParams } from "./shared";

const emptyData = { resources: [] };
const zipMimeType = "application/zip";

export const gameUpdateQueryOptions = (
  params: ApiParams<{
    gameClientId: GameClientId;
    internalVersion: LocalGameInternalVersion;
  }>,
  options: {
    enabled?: boolean;
  },
  additionalOptions: {
    remoteGameInfo: DetailsPageGameInfo | null;
  },
) =>
  queryOptions({
    queryKey: ["gamesUpdate", params],
    queryFn: () =>
      params.internalVersion === "legacy"
        ? emptyData
        : fetchGameUpdate({
            ...params,
            internalVersion: params.internalVersion,
          }),
    enabled: options.enabled && params.internalVersion !== "legacy",
    initialData: emptyData,

    select: (data) => {
      const remoteGameInfo = additionalOptions.remoteGameInfo;
      if (!remoteGameInfo) return data;

      const fullPackageDownloads: GameUpdateInfo["resources"][number] = {
        internalVersion: remoteGameInfo.internalVersion,
        patch: {
          url: remoteGameInfo.downloadUrl,
          mimeType: zipMimeType,
        },
        patchMetadata: { url: remoteGameInfo.downloadUrl, mimeType: zipMimeType },
        patchSize: remoteGameInfo.packageSizeInMb,
        isFullPackage: true,
      };

      const resources = [
        fullPackageDownloads,
        ...data.resources.map((resource) => ({ ...resource, isFullPackage: false })),
      ];

      return { resources };
    },
  });
