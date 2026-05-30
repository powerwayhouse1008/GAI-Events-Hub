"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import type { Profile } from "@/lib/types";

function refreshAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/organizers");
  revalidatePath("/admin/accounts");
}

function profileFromAuthUser(user: {
  id: string;
  email?: string | null;
  created_at?: string;
  user_metadata?: Record<string, unknown>;
}): Profile {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || null,
    display_name:
      String(metadata.display_name || metadata.full_name || user.email?.split("@")[0] || "User"),
    avatar_url: typeof metadata.avatar_url === "string" ? metadata.avatar_url : null,
    company_name: typeof metadata.company_name === "string" ? metadata.company_name : null,
    role: "member",
    organizer_status: "pending",
    created_at: user.created_at || new Date().toISOString()
  };
}

export async function syncOrganizerRequests() {
  await requireAdmin();
  const supabase = createAdminClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return;

    const requestedOrganizers = data.users.filter(
      (user) => user.user_metadata?.requested_role === "organizer"
    );

    for (const user of requestedOrganizers) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").upsert(profileFromAuthUser(user), { onConflict: "id" });
        continue;
      }

      if (
        profile.role === "member" &&
        (profile.organizer_status === "none" || profile.organizer_status === "rejected")
      ) {
        await supabase
          .from("profiles")
          .update({ organizer_status: "pending" })
          .eq("id", user.id);
      }
    }

    if (data.users.length < 100) break;
    page += 1;
  }
}

export async function approveOrganizer(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("profiles")
    .update({ role: "organizer", organizer_status: "approved" })
    .eq("id", id);

  refreshAdminPages();
}

export async function rejectOrganizer(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await supabase
    .from("profiles")
    .update({ role: "member", organizer_status: "rejected" })
    .eq("id", id);

  refreshAdminPages();
}
