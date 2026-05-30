"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_ADMIN_EMAIL = "mai@powerway.jp";
const DEFAULT_ADMIN_PASSWORD = "Dao123123";

async function findAuthUserByEmail(email: string) {
  const supabase = createAdminClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error) throw error;

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

async function ensureProfile(id: string) {
  const supabase = createAdminClient();
  const user = await findAuthUserById(id);
  if (!user) return null;

  const profile = {
    id: user.id,
    email: user.email || null,
    display_name:
      String(user.user_metadata?.display_name || user.user_metadata?.full_name || "") ||
      user.email?.split("@")[0] ||
      "User",
    avatar_url: typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : null,
    company_name:
      typeof user.user_metadata?.company_name === "string" ? user.user_metadata.company_name : null,
    role: "member",
    organizer_status: user.user_metadata?.requested_role === "organizer" ? "pending" : "none"
  };

  await supabase.from("profiles").upsert(profile, { onConflict: "id" });
  return profile;
}

export async function grantAdmin(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await ensureProfile(id);

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin", organizer_status: "approved" })
    .eq("id", id);

  if (error) {
    throw new Error("管理者権限を付与できませんでした。");
  }

  revalidatePath("/admin/accounts");
}

export async function revokeAdmin(formData: FormData) {
  const currentAdmin = await requireAdmin();
  const supabase = createAdminClient();
  const id = String(formData.get("id"));
  await ensureProfile(id);

  if (id === currentAdmin.id) {
    throw new Error("自分自身の管理者権限は解除できません。");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: "member", organizer_status: "none" })
    .eq("id", id);

  if (error) {
    throw new Error("管理者権限を解除できませんでした。");
  }

  revalidatePath("/admin/accounts");
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
    if (error) throw error;
    user = data.user;
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
    if (error) throw error;
    user = data.user;
  }

  const { data: duplicateProfiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email);

  await Promise.all(
    (duplicateProfiles ?? [])
      .filter((profile) => profile.id !== user.id)
      .map((profile) => supabase.from("profiles").update({ email: null }).eq("id", profile.id))
  );

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email,
    display_name: "MAI",
    role: "admin",
    organizer_status: "approved"
  });

  if (error) {
    throw new Error("デフォルト管理者を作成できませんでした。");
  }

  revalidatePath("/admin/accounts");
}
