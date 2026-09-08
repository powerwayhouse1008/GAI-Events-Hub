import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/types";
import { CalendarClient } from "./CalendarClient";

const calendarEventColumns = "id,title,category,region,location,cover_url,starts_at,ends_at";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: events = [] } = await supabase
    .from("events")
    .select(calendarEventColumns)
    .eq("status", "published")
    .order("starts_at");

  return <CalendarClient events={(events || []) as Event[]} />;
}
