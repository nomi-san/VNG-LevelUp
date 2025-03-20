export const envRender = {
  environment: import.meta.env.MODE,

  gameService: import.meta.env.VITE_GAME_SERVICE_DOMAIN,

  sentryDsn: import.meta.env.RENDERER_VITE_SENTRY_DSN,
} as const;
