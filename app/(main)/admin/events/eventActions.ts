"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function unpublishEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("events").update({ status: "draft" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/events");
  revalidatePath("/events");
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

export async function copyEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();
  if (!event) return;

  const { id: _id, created_at: _createdAt, ...copy } = event;
  const { data } = await supabase
    .from("events")
    .insert({
      ...copy,
      title: `${event.title} コピー`,
      status: "draft",
      featured: false
    })
    .select("id")
    .single();

  revalidatePath("/admin/events");
  if (data?.id) redirect(`/events/${data.id}/edit`);
}
