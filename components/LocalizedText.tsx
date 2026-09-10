"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function LocalizedText({ text }: { text: string }) {
  const { t } = useLanguage();
  return <>{t(text)}</>;
}
