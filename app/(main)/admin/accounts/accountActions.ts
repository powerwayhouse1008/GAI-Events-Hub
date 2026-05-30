"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function grantAdmin(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  await supabase
    .from("profiles")
    .update({ role: "admin", organizer_status: "approved" })
    .eq("id", id);

  revalidatePath("/admin/accounts");
}

export async function revokeAdmin(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));

  if (id === currentAdmin.id) {
    throw new Error("You cannot remove your own admin role.");
  }

  await supabase
    .from("profiles")
    .update({ role: "member", organizer_status: "none" })
    .eq("id", id);

  revalidatePath("/admin/accounts");
}

export async function createDefaultAdmin() {
  await requireAdmin();
  const supabase = createAdminClient();
  const email = "mai@powerway.jp";
  const password = "Dao123123";

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId = existingProfile?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: "Powerway Admin",
        requested_role: "member"
      }
    });

    if (error) {
      throw error;
    }

    userId = data.user.id;
  }

  await supabase.from("profiles").upsert({
    id: userId,
    email,
    display_name: "MAI",
    role: "admin",
    organizer_status: "approved"
  });

  revalidatePath("/admin/accounts");
}
