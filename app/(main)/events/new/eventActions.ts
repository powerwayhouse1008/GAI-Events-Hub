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

type GenerateEventCoverInput = {
  title: string;
  description: string;
  category: string;
  region: string;
  location: string;
  themeColor: string;
};

function floorToMinute(date: Date) {
  const nextDate = new Date(date);
  nextDate.setSeconds(0, 0);
  return nextDate;
}

function buildCoverPrompt(input: GenerateEventCoverInput) {
  const themeHints: Record<string, string> = {
    purple: "violet and magenta futuristic lighting",
    blue: "deep blue and cyan technology lighting",
    green: "emerald and teal innovation lighting",
    amber: "warm amber and orange business conference lighting",
    rose: "rose and pink neon creative lighting"
  };

  return [
    "Create a premium landscape event cover image for a professional Global AI Industry Alliance event.",
    "Use a polished conference visual style with cinematic depth, modern technology details, and space for overlaid event text.",
    "Do not include readable words, logos, watermarks, distorted text, or UI screenshots.",
    `Event title: ${input.title || "AI industry event"}.`,
    `Event category/theme: ${input.category || "AI"}.`,
    input.description ? `Event description: ${input.description.slice(0, 900)}.` : "",
    input.location ? `Venue or location context: ${input.location}.` : "",
    input.region ? `Region: ${input.region}.` : "",
    `Color direction: ${themeHints[input.themeColor] || themeHints.purple}.`,
    "Aspect ratio: 3:2 landscape, suitable as an event thumbnail and hero cover."
  ]
    .filter(Boolean)
    .join(" ");
}

function readImageBase64(responseJson: unknown) {
  if (
    typeof responseJson === "object" &&
    responseJson !== null &&
    "data" in responseJson &&
    Array.isArray((responseJson as { data?: unknown }).data)
  ) {
    const firstImage = (responseJson as { data: Array<{ b64_json?: unknown }> }).data[0];
    return typeof firstImage?.b64_json === "string" ? firstImage.b64_json : null;
  }

  return null;
}

export async function generateEventCover(input: GenerateEventCoverInput) {
  const profile = await requireOrganizer();
  const supabase = createAdminClient();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return { error: "Thiếu OPENAI_API_KEY trong biến môi trường." };
  }

  if (!input.title.trim() && !input.description.trim()) {
    return { error: "Vui lòng nhập tên hoặc mô tả sự kiện trước khi tạo ảnh." };
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1.5",
      prompt: buildCoverPrompt(input),
      n: 1,
      size: "1536x1024",
      quality: "medium"
    })
  });

  const responseJson = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const message =
      typeof responseJson === "object" &&
      responseJson !== null &&
      "error" in responseJson &&
      typeof (responseJson as { error?: { message?: unknown } }).error?.message === "string"
        ? (responseJson as { error: { message: string } }).error.message
        : "Không thể tạo ảnh đại diện bằng AI.";

    return { error: message };
  }

  const imageBase64 = readImageBase64(responseJson);
  if (!imageBase64) {
    return { error: "OpenAI không trả về dữ liệu ảnh hợp lệ." };
  }

  const imageBuffer = Buffer.from(imageBase64, "base64");
  const path = `${profile.id}/generated-${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage.from("event-covers").upload(path, imageBuffer, {
    contentType: "image/png"
  });

  if (uploadError) {
    return { error: `Không thể lưu ảnh vào Supabase Storage. ${uploadError.message}` };
  }

  const { data } = supabase.storage.from("event-covers").getPublicUrl(path);
  return { coverUrl: data.publicUrl };
}

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
  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(input.endsAt);

  if (Number.isNaN(endsAt.getTime()) || endsAt < startsAt) {
    return { error: "終了日時は開始日時以降を選択してください。" };
  }

  const profileError = await ensureOrganizerProfile(profile);
  if (profileError) {
    return { error: `主催者プロフィールを作成できませんでした。${profileError.message}` };
  }

  let organizerId = profile.id;
  let existingStatus: string | null = null;
  let existingTitle: string | null = null;
  let existingCoverUrl: string | null = null;
  let existingStartsAt: string | null = null;

  if (input.eventId) {
    const { data: existingEvent, error: fetchError } = await supabase
      .from("events")
      .select("organizer_id, status, title, cover_url, starts_at")
      .eq("id", input.eventId)
      .single();

    if (fetchError || !existingEvent) {
      return { error: "イベントが見つかりません。" };
    }

    if (profile.role !== "admin" && existingEvent.organizer_id !== profile.id) {
      return { error: "このイベントを編集する権限がありません。" };
    }

    organizerId = existingEvent.organizer_id;
    existingStatus = existingEvent.status;
    existingTitle = existingEvent.title;
    existingCoverUrl = existingEvent.cover_url;
    existingStartsAt = existingEvent.starts_at;
  }

  const existingStartMinute = existingStartsAt ? floorToMinute(new Date(existingStartsAt)).getTime() : null;
  const startsAtMinute = floorToMinute(startsAt).getTime();
  const startChanged = existingStartMinute !== null && startsAtMinute !== existingStartMinute;

  if (Number.isNaN(startsAt.getTime()) || ((!input.eventId || startChanged) && startsAt < floorToMinute(new Date()))) {
    return { error: "開始日時は現在時刻以降を選択してください。過去のイベントは作成できません。" };
  }

  const needsAdminReview =
    !input.eventId ||
    existingStatus !== "published" ||
    input.title !== (existingTitle || "") ||
    input.coverUrl !== (existingCoverUrl || null);

  const nextStatus = profile.role === "admin" ? "published" : needsAdminReview ? "pending" : existingStatus || "pending";

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
    status: nextStatus,
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
