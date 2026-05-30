"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ADMIN_EMAIL = "mai@powerway.jp";
const DEFAULT_ADMIN_PASSWORD = "Dao123123";

function refreshAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/accounts");
  revalidatePath("/admin/organizers");
}

async function findAuthUserByEmail(email: string) {
  const supabase = createAdminClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return null;

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email.toLowerCase()
    );
    if (user) return user;
    if (data.users.length < 100) return null;
    page += 1;
  }
}

async function findAuthUserById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(id);
  if (error) return null;
  return data.user;
}

async function clearDuplicateProfileEmails(email: string | null | undefined, keepId: string) {
  if (!email) return;

  const supabase = createAdminClient();
  const { data: duplicateProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email);

  await Promise.all(
    (duplicateProfiles ?? [])
      .filter((profile) => profile.id !== keepId)
      .map((profile) => supabase.from("profiles").update({ email: null }).eq("id", profile.id))
  );
}

async function ensureProfile(id: string) {
  const supabase = createAdminClient();

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (existingProfile) return existingProfile;

  const user = await findAuthUserById(id);
  if (!user) return null;

  await clearDuplicateProfileEmails(user.email, user.id);

  const { data: profile } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email || null,
        display_name:
          String(user.user_metadata?.display_name || user.user_metadata?.full_name || "") ||
          user.email?.split("@")[0] ||
          "User",
        avatar_url:
          typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
        company_name:
          typeof user.user_metadata?.company_name === "string"
            ? user.user_metadata.company_name
            : null,
        role: "member",
        organizer_status: user.user_metadata?.requested_role === "organizer" ? "pending" : "none"
      },
      { onConflict: "id" }
    )
    .select("*")
    .maybeSingle();

  return profile;
}

export async function grantAdmin(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  await ensureProfile(id);

  await supabase
    .from("profiles")
    .update({ role: "admin", organizer_status: "approved" })
    .eq("id", id);

  refreshAdminPages();
}

export async function revokeAdmin(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return;

  if (id === currentAdmin.id) {
    refreshAdminPages();
    return;
  }

  await ensureProfile(id);

  await supabase
    .from("profiles")
    .update({ role: "member", organizer_status: "none" })
    .eq("id", id);

  refreshAdminPages();
}

export async function createDefaultAdmin() {
  await requireAdmin();
  const supabase = createAdminClient();
  const email = DEFAULT_ADMIN_EMAIL;
  const password = DEFAULT_ADMIN_PASSWORD;

  let user = await findAuthUserByEmail(email);

  if (user) {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        ...user.user_metadata,
        display_name: user.user_metadata?.display_name || "MAI"
      }
    });
    if (!error) user = data.user;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: "MAI",
        requested_role: "member"
      }
    });
    if (error) {
      refreshAdminPages();
      return;
    }
    user = data.user;
  }

  await clearDuplicateProfileEmails(email, user.id);

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      display_name: "MAI",
      role: "admin",
      organizer_status: "approved"
    },
    { onConflict: "id" }
  );

  refreshAdminPages();
}
