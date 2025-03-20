import { useQuery } from "@tanstack/react-query";
import React, { type PropsWithChildren } from "react";

import { configQueryOptions } from "@renderer/apis/config";

import { type ConfigItemInfo } from "@src/types/config";

import { useLanguageProvider } from "./LanguageProvider";
import { useSessionProvider } from "./SessionProvider";

const AppConfigContext = React.createContext<ConfigItemInfo>(null as unknown as ConfigItemInfo);
const emptyConfigInfo: ConfigItemInfo = {
  externalUrl: {
    tos: "",
    cs: "",
    privacy: "",
  },
};
export const AppConfigProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { language } = useLanguageProvider();
  const { guestId, launcherUser } = useSessionProvider();
  const { data } = useQuery(
    configQueryOptions({
      language,
      guestId,
      userId: launcherUser?.userId,
    }),
  );
  return (
    <AppConfigContext.Provider value={data?.configs ?? emptyConfigInfo}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const appConfig = React.useContext(AppConfigContext);

  return appConfig;
};
