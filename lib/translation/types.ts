import type { LanguageCode } from "@/lib/i18n";

export type TranslationProgress = {
  stage: "loading" | "translating" | "saving" | "complete" | "error";
  message: string;
  progress?: number;
};

export type EventTranslationInput = {
  title: string;
  description: string;
  location: string;
  sourceLanguage: LanguageCode;
};

export type EventTranslations = {
  title_i18n: Record<LanguageCode, string>;
  description_i18n: Record<LanguageCode, string>;
  location_i18n: Record<LanguageCode, string>;
};
