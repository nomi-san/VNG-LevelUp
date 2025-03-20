interface ExternalUrl {
  tos: string;
  privacy: string;
  cs: string;
}

export interface ConfigItemInfo {
  externalUrl: ExternalUrl;
}
export interface ConfigInfo {
  configs: ConfigItemInfo;
  nextCallInSeconds: number;
}
