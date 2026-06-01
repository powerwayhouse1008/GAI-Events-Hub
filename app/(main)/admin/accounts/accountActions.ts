"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ADMIN_EMAIL = "mai@powerway.jp";
const DEFAULT_ADMIN_PASSWORD = "Dao123123";

function refreshAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/accounts");
}

export type AccountActionResult = {
  ok: boolean;
  message?: string;
  account?: {
    id: string;
    role?: "member" | "organizer" | "admin";
    organizer_status?: "none" | "pending" | "approved" | "rejected";
  };
  deletedId?: string;
};

function isForeignKeyError(error: { code?: string; message?: string } | null) {
  return error?.code === "23503" || Boolean(error?.message?.includes("violates foreign key constraint"));
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

  const payload = {
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
    role: user.user_metadata?.requested_role === "organizer" ? "organizer" : "member",
    organizer_status: user.user_metadata?.requested_role === "organizer" ? "approved" : "none"
  };

  const { data: profile, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (!error) return profile;

  for (const role of ["member", "user", "participant", "attendee"]) {
    const { data: fallbackProfile, error: fallbackError } = await supabase
      .from("profiles")
      .insert({
        ...payload,
        role,
        organizer_status: "none"
      })
      .select("*")
      .maybeSingle();

    if (!fallbackError) return fallbackProfile;
  }

  return profile;
}

export async function grantAdmin(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Account id is missing." } satisfies AccountActionResult;

  const profile = await ensureProfile(id);
  if (!profile) return { ok: false, message: "Profile could not be prepared." } satisfies AccountActionResult;

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin", organizer_status: "approved" })
    .eq("id", id);

  if (error) return { ok: false, message: error.message } satisfies AccountActionResult;

  refreshAdminPages();
  return {
    ok: true,
    account: { id, role: "admin", organizer_status: "approved" }
  } satisfies AccountActionResult;
}

export async function revokeAdmin(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Account id is missing." } satisfies AccountActionResult;

  if (id === currentAdmin.id) {
    refreshAdminPages();
    return { ok: false, message: "You cannot revoke your own admin access." } satisfies AccountActionResult;
  }

  const profile = await ensureProfile(id);
  if (!profile) return { ok: false, message: "Profile could not be prepared." } satisfies AccountActionResult;

  const { error } = await supabase
    .from("profiles")
    .update({ role: "member", organizer_status: "none" })
    .eq("id", id);

  if (error) return { ok: false, message: error.message } satisfies AccountActionResult;

  refreshAdminPages();
  return {
    ok: true,
    account: { id, role: "member", organizer_status: "none" }
  } satisfies AccountActionResult;
}

export async function deleteAccount(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id") || "");
  if (!id) return { ok: false, message: "Account id is missing." } satisfies AccountActionResult;

  if (id === currentAdmin.id) {
    refreshAdminPages();
    return { ok: false, message: "You cannot delete your own account." } satisfies AccountActionResult;
  }

  const { error: profileError } = await supabase.from("profiles").delete().eq("id", id);
  if (profileError) {
    if (!isForeignKeyError(profileError)) {
      return { ok: false, message: profileError.message } satisfies AccountActionResult;
    }

    const { error: anonymizeError } = await supabase
      .from("profiles")
      .update({
        email: null,
        display_name: "Deleted account",
        avatar_url: null,
        company_name: null,
        role: "member",
        organizer_status: "none",
        deleted_at: new Date().toISOString()
      })
      .eq("id", id);

    if (anonymizeError) {
      return { ok: false, message: anonymizeError.message } satisfies AccountActionResult;
    }

    refreshAdminPages();
    return { ok: true, deletedId: id } satisfies AccountActionResult;
  }

  const { error: authError } = await supabase.auth.admin.deleteUser(id);
  if (authError && !isForeignKeyError(authError)) {
    return { ok: false, message: authError.message } satisfies AccountActionResult;
  }

  refreshAdminPages();
  return { ok: true, deletedId: id } satisfies AccountActionResult;
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
      return { ok: false, message: error.message } satisfies AccountActionResult;
    }
    user = data.user;
  }

  await clearDuplicateProfileEmails(email, user.id);

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email,
      display_name: "MAI",
      role: "admin",
      organizer_status: "approved"
    },
    { onConflict: "id" }
  );

  if (error) return { ok: false, message: error.message } satisfies AccountActionResult;

  refreshAdminPages();
  return {
    ok: true,
    account: { id: user.id, role: "admin", organizer_status: "approved" }
  } satisfies AccountActionResult;
}
