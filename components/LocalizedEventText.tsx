"use client";

import { useMemo } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { pickLocalized } from "@/lib/i18n";
import type { Event } from "@/lib/types";

type LocalizedEvent = Event & {
  organizerName: string;
};

export function useLocalizedEvent(event: Event): LocalizedEvent {
  const { language } = useLanguage();

  return useMemo(
    () => ({
      ...event,
      title: pickLocalized(event.title_i18n, language, event.source_language) || event.title,
      description: pickLocalized(event.description_i18n, language, event.source_language) || event.description || null,
      location: pickLocalized(event.location_i18n, language, event.source_language) || event.location || null,
      organizerName: pickLocalized(
        event.creator?.display_name_i18n ??
          event.creator?.name_i18n ??
          event.creator_name_i18n ??
          event.organizer_name_i18n ??
          event.creator?.display_name ??
          event.creator_name ??
          event.organizer_name,
        language,
        event.source_language
      )
    }),
    [event, language]
  );
}

export function LocalizedEventText({
  event,
  field,
  fallback = ""
}: {
  event: Event;
  field: "title" | "description" | "location" | "organizerName";
  fallback?: string;
}) {
  const localizedEvent = useLocalizedEvent(event);
  return <>{localizedEvent[field] || fallback}</>;
}
