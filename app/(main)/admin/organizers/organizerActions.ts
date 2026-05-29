"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export async function approveOrganizer(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await supabase.from("profiles").update({ role: "organizer", organizer_status: "approved" }).eq("id", id);
  revalidatePath("/admin/organizers");
}

export async function rejectOrganizer(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await supabase.from("profiles").update({ role: "member", organizer_status: "rejected" }).eq("id", id);
  revalidatePath("/admin/organizers");
}
