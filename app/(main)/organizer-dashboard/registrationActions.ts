"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrganizer } from "@/lib/auth";

async function updateRegistrationStatus(formData: FormData, status: "approved" | "rejected") {
  const profile = await requireOrganizer();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const { data: registration } = await supabase
    .from("registrations")
    .select("id, event_id, events(organizer_id)")
    .eq("id", id)
    .single();

  const event = Array.isArray(registration?.events)
    ? registration?.events[0]
    : registration?.events;

  if (profile.role !== "admin" && event?.organizer_id !== profile.id) {
    return;
  }

  await supabase.from("registrations").update({ status }).eq("id", id);
  if (registration?.event_id) revalidatePath(`/events/${registration.event_id}`);
  revalidatePath("/organizer-dashboard");
}

export async function approveRegistration(formData: FormData) {
  await updateRegistrationStatus(formData, "approved");
}

export async function rejectRegistration(formData: FormData) {
  await updateRegistrationStatus(formData, "rejected");
}
