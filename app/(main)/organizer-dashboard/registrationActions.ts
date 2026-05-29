"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOrganizer } from "@/lib/auth";

export async function approveRegistration(formData: FormData) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.from("registrations").update({ status: "approved" }).eq("id", String(formData.get("id")));
  revalidatePath("/organizer-dashboard");
}

export async function rejectRegistration(formData: FormData) {
  await requireOrganizer();
  const supabase = await createClient();
  await supabase.from("registrations").update({ status: "rejected" }).eq("id", String(formData.get("id")));
  revalidatePath("/organizer-dashboard");
}
