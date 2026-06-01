"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

export type RegisterEventResult = {
  ok: boolean;
  message: string;
  status?: "pending" | "approved" | "rejected";
};

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

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User",
      avatar_url: user.user_metadata?.avatar_url || null,
      company_name: user.user_metadata?.company_name || null
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return {
      ok: false,
      message: `プロフィールを準備できませんでした: ${profileError.message}`
    } satisfies RegisterEventResult;
  }

  const status = event.approval_mode === "auto" ? "approved" : "pending";
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
    const { error: insertError } = await supabase.from("registrations").insert({
      event_id: eventId,
      user_id: user.id,
      message,
      status
    });

    if (insertError) {
      return {
        ok: false,
        message: `参加申込を保存できませんでした: ${insertError.message}`
      } satisfies RegisterEventResult;
    }
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
