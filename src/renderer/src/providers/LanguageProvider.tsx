import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import type { SupportedLanguage } from "@src/const/language";

const LanguageContext = createContext<{
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
}>({
  language: "vi",
  setLanguage: () => {},
});

export const LanguageProvider = ({ children }: PropsWithChildren<object>): JSX.Element => {
  const [language, setLanguage] = useState<SupportedLanguage>("vi");

  const contextValue = useMemo(() => {
    return {
      language,
      setLanguage,
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

export const useLanguageProvider = () => {
  const contextValue = useContext(LanguageContext);

  return contextValue;
};
