export const envNode = {
  environment: import.meta.env.MODE as "test" | "stg" | "production",

  gameService: import.meta.env.VITE_GAME_SERVICE_DOMAIN,

  login: import.meta.env.MAIN_VITE_LOGIN_DOMAIN,

  webshop: import.meta.env.MAIN_VITE_WEBSHOP_DOMAIN,
  webshopCookieWildcard: import.meta.env.MAIN_VITE_WEBSHOP_WILDCARD_DOMAIN,
  myAccount: import.meta.env.MAIN_VITE_ACCOUNT_MANAGER,
  myAccountWildcard: import.meta.env.MAIN_VITE_ACCOUNT_WILDCARD_DOMAIN,

  minigames: "m.choingay.vn",
  launcher: import.meta.env.MAIN_VITE_LAUNCHER_DOMAIN,
  sentryDsn: import.meta.env.MAIN_VITE_SENTRY_DSN,

  loginPageOrigin: import.meta.env.MAIN_VITE_LOGIN_PAGE,

  isInAutoTestEnvironment: import.meta.env.MAIN_VITE_TEST_ENV === "playwright",
} as const;
