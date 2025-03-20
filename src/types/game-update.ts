export type GameUpdateResource = {
  internalVersion: number;
  patch: {
    mimeType: string;
    url: string;
  };
  patchMetadata: {
    mimeType: string;
    url: string;
  };
  patchSize: number;
  isFullPackage: boolean;
};

export interface GameUpdateInfo {
  resources: GameUpdateResource[];
}
