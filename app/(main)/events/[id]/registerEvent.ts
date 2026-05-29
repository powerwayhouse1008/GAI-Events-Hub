"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function registerEvent(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const eventId = String(formData.get("event_id"));
  const message = String(formData.get("message") || "");

  const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single();

  if (!event) redirect("/events");

  const status = event.approval_mode === "auto" ? "approved" : "pending";

  await supabase.from("registrations").insert({
    event_id: eventId,
    user_id: user.id,
    message,
    status
  });

  redirect("/me");
}
