export const LANGUAGE_SUPPORTED = ["en", "vi", "th", "id", "zh-Hans", "zh-Hant"] as const;
export type SupportedLanguage = (typeof LANGUAGE_SUPPORTED)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";
