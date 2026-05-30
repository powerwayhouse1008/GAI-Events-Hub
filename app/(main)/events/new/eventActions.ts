"use server";

import { requireOrganizer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type SaveEventInput = {
  eventId?: string;
  title: string;
  description: string;
  organizerName: string;
  category: string;
  region: string;
  location: string;
  onlineUrl: string;
  coverUrl: string | null;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  ticketPrice: number;
  approvalMode: string;
  featured: boolean;
};

export async function saveEvent(input: SaveEventInput) {
  const profile = await requireOrganizer();
  const supabase = createAdminClient();

  if (input.eventId && profile.role !== "admin") {
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", input.eventId)
      .single();

    if (fetchError || !existingEvent || existingEvent.organizer_id !== profile.id) {
      return { error: "このイベントを編集する権限がありません。" };
    }
  }

  const payload = {
    title: input.title,
    description: input.description,
    organizer_id: profile.id,
    organizer_name: input.organizerName,
    category: input.category,
    region: input.region,
    location: input.location,
    online_url: input.onlineUrl,
    cover_url: input.coverUrl,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    capacity: input.capacity,
    ticket_price: input.ticketPrice,
    approval_mode: input.approvalMode,
    status: "pending",
    featured: input.featured
  };

  const { data, error } = input.eventId
    ? await supabase
        .from("events")
        .update(payload)
        .eq("id", input.eventId)
        .select("id")
        .single()
    : await supabase.from("events").insert(payload).select("id").single();

  if (error) {
    return { error: `イベントを保存できませんでした。${error.message}` };
  }

  return { id: data.id as string };
}
