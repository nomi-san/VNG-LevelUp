import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "./vi";

const defaultNS = "ns1";

void i18next.use(initReactI18next).init({
  debug: true,
  fallbackLng: "en",
  defaultNS,
  resources: {
    en: {
      ns1: vi,
    },
    vi: {
      ns1: vi,
    },
  },
});

export default i18next;
