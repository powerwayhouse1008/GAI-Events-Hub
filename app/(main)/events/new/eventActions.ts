"use server";

import { requireOrganizer } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyEventParticipants } from "@/lib/event-notifications";
import type { Profile } from "@/lib/types";

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
  themeColor: string;
  startsAt: string;
  endsAt: string;
  capacity: number | null;
  ticketPrice: number;
  approvalMode: string;
  featured: boolean;
};

async function ensureOrganizerProfile(profile: Profile) {
  const supabase = createAdminClient();
  const email = profile.email || null;

  const { data: existingById } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profile.id)
    .maybeSingle();

  if (!existingById && email) {
    const { data: existingByEmail } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingByEmail && existingByEmail.id !== profile.id) {
      await supabase.from("profiles").update({ email: null }).eq("id", existingByEmail.id);
    }
  }

  const { error } = await supabase.from("profiles").upsert({
    id: profile.id,
    email,
    display_name: profile.display_name || email?.split("@")[0] || "Organizer",
    avatar_url: profile.avatar_url,
    company_name: profile.company_name,
    role: profile.role,
    organizer_status: profile.role === "admin" ? "approved" : profile.organizer_status
  });

  return error;
}

export async function saveEvent(input: SaveEventInput) {
  const profile = await requireOrganizer();
  const supabase = createAdminClient();

  const profileError = await ensureOrganizerProfile(profile);
  if (profileError) {
    return { error: `主催者プロフィールを作成できませんでした。${profileError.message}` };
  }

  let organizerId = profile.id;

  if (input.eventId) {
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", input.eventId)
      .single();

    if (fetchError || !existingEvent) {
      return { error: "イベントが見つかりません。" };
    }

    if (profile.role !== "admin" && existingEvent.organizer_id !== profile.id) {
      return { error: "このイベントを編集する権限がありません。" };
    }

    organizerId = existingEvent.organizer_id;
  }

  const payload = {
    title: input.title,
    description: input.description,
    organizer_id: organizerId,
    organizer_name: input.organizerName,
    category: input.category,
    region: input.region,
    location: input.location,
    online_url: input.onlineUrl,
    cover_url: input.coverUrl,
    theme_color: input.themeColor,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    capacity: input.capacity,
    ticket_price: input.ticketPrice,
    approval_mode: input.approvalMode,
    status: "pending",
    featured: input.featured
  };

  const { data, error } = input.eventId
    ? await supabase.from("events").update(payload).eq("id", input.eventId).select("id").single()
    : await supabase.from("events").insert(payload).select("id").single();

  if (error) {
    return { error: `イベントを保存できませんでした。${error.message}` };
  }

  if (input.eventId) {
    await notifyEventParticipants({
      eventId: input.eventId,
      actorId: profile.id,
      type: "event_update",
      title: input.title,
      message: "イベント情報が更新されました。"
    });
  }

  return { id: data.id as string };
}
