"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth";

export async function registerEvent(formData: FormData) {
  const user = await requireUser();
  const supabase = createAdminClient();

  const eventId = String(formData.get("event_id") || "");
  const message = String(formData.get("message") || "");

  const { data: event } = await supabase
    .from("events")
    .select("id, status, approval_mode")
    .eq("id", eventId)
    .single();

  if (!event) redirect("/events");
  if (event.status !== "published") redirect(`/events/${eventId}`);

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User",
      avatar_url: user.user_metadata?.avatar_url || null,
      company_name: user.user_metadata?.company_name || null,
      role: user.user_metadata?.requested_role === "organizer" ? "organizer" : "member",
      organizer_status: user.user_metadata?.requested_role === "organizer" ? "approved" : "none"
    },
    { onConflict: "id" }
  );

  const status = event.approval_mode === "auto" ? "approved" : "pending";
  const { data: existing } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("registrations")
      .update({ message, status })
      .eq("id", existing.id);
  } else {
    await supabase.from("registrations").insert({
      event_id: eventId,
      user_id: user.id,
      message,
      status
    });
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/me");
  redirect(`/events/${eventId}`);
}
