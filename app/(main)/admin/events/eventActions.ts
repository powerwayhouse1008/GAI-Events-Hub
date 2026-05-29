"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function approveEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("events").update({ status: "published" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function rejectEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("events").update({ status: "rejected" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", String(formData.get("id")));
  revalidatePath("/admin/events");
}

export async function featureEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const { data } = await supabase.from("events").select("featured").eq("id", id).single();
  await supabase.from("events").update({ featured: !data?.featured }).eq("id", id);
  revalidatePath("/admin/events");
  revalidatePath("/events");
}
