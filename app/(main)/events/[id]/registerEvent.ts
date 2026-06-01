"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";
import { sendRegistrationStatusEmail } from "@/lib/event-email-notifications";

export type RegisterEventResult = {
  ok: boolean;
  message: string;
  status?: "pending" | "approved" | "rejected";
};

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

function profilePayload(user: Awaited<ReturnType<typeof requireUser>>) {
  return {
    id: user.id,
    email: user.email,
    display_name:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    avatar_url: user.user_metadata?.avatar_url || null,
    company_name: user.user_metadata?.company_name || null
  };
}

async function ensureParticipantProfile(
  supabase: SupabaseAdminClient,
  user: Awaited<ReturnType<typeof requireUser>>
) {
  const payload = profilePayload(user);

  const { data: existing, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (lookupError) return lookupError;

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({
        email: payload.email,
        display_name: payload.display_name,
        avatar_url: payload.avatar_url,
        company_name: payload.company_name
      })
      .eq("id", user.id);
    return error;
  }

  const { error: defaultInsertError } = await supabase.from("profiles").insert(payload);
  if (!defaultInsertError) return null;

  // Some deployed databases still have an older role check constraint whose
  // accepted participant value is not "member". Try common legacy values.
  const roleCandidates = ["member", "user", "participant", "attendee"];
  let lastError = defaultInsertError;

  for (const role of roleCandidates) {
    const { error } = await supabase.from("profiles").insert({
      ...payload,
      role,
      organizer_status: "none"
    });

    if (!error) return null;
    lastError = error;
  }

  return lastError;
}

export async function registerEvent(formData: FormData) {
  const user = await requireUser();
  const supabase = createAdminClient();

  const eventId = String(formData.get("event_id") || "");
  const message = String(formData.get("message") || "").trim();

  if (!eventId) {
    return { ok: false, message: "イベントが見つかりません。" } satisfies RegisterEventResult;
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, status, approval_mode")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { ok: false, message: "イベントが見つかりません。" } satisfies RegisterEventResult;
  }

  if (event.status !== "published") {
    return { ok: false, message: "このイベントはまだ参加申込できません。" } satisfies RegisterEventResult;
  }

  const profileError = await ensureParticipantProfile(supabase, user);

  if (profileError) {
    return {
      ok: false,
      message: `プロフィールを準備できませんでした: ${profileError.message}`
    } satisfies RegisterEventResult;
  }

  const status = event.approval_mode === "auto" ? "approved" : "pending";
  let savedRegistrationId: string | null = null;
  const { data: existing, error: existingError } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      message: `申込状況を確認できませんでした: ${existingError.message}`
    } satisfies RegisterEventResult;
  }

  if (existing) {
    savedRegistrationId = existing.id;
    const { error: updateError } = await supabase
      .from("registrations")
      .update({ message, status })
      .eq("id", existing.id);

    if (updateError) {
      return {
        ok: false,
        message: `参加申込を更新できませんでした: ${updateError.message}`
      } satisfies RegisterEventResult;
    }
  } else {
    const { data: insertedRegistration, error: insertError } = await supabase
      .from("registrations")
      .insert({
        event_id: eventId,
        user_id: user.id,
        message,
        status
      })
      .select("id")
      .single();

    if (insertError) {
      return {
        ok: false,
        message: `参加申込を保存できませんでした: ${insertError.message}`
      } satisfies RegisterEventResult;
    }

    savedRegistrationId = insertedRegistration?.id || null;
  }

  if (status === "approved" && savedRegistrationId) {
    await sendRegistrationStatusEmail(savedRegistrationId, "approved");
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/me");
  revalidatePath("/organizer-dashboard");

  return {
    ok: true,
    status,
    message: status === "approved" ? "参加申込が完了しました。" : "参加申込を送信しました。主催者の承認をお待ちください。"
  } satisfies RegisterEventResult;
}
