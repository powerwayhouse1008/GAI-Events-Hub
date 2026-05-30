import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";
import { getAppSessionUserId } from "@/lib/app-session";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (user) return user;

  const appSessionUserId = await getAppSessionUserId();
  if (!appSessionUserId) return null;

  try {
    const admin = createAdminClient();
    const {
      data: { user: appUser }
    } = await admin.auth.admin.getUserById(appSessionUserId);
    return appUser;
  } catch {
    return null;
  }
}

function profileFromUser(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>): Profile {
  const configuredAdminEmail = (process.env.ADMIN_EMAIL || "mai@powerway.jp").toLowerCase();
  const isConfiguredAdmin = user.email?.toLowerCase() === configuredAdminEmail;
  const isOrganizer = user.user_metadata?.requested_role === "organizer";

  return {
    id: user.id,
    email: user.email || null,
    display_name:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    avatar_url: user.user_metadata?.avatar_url || null,
    company_name: user.user_metadata?.company_name || null,
    role: isConfiguredAdmin ? "admin" : isOrganizer ? "organizer" : "member",
    organizer_status: isConfiguredAdmin || isOrganizer ? "approved" : "none",
    created_at: user.created_at
  };
}

async function upsertProfileWithServiceRole(profile: Profile) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .upsert(
      {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        company_name: profile.company_name,
        role: profile.role,
        organizer_status: profile.organizer_status
      },
      { onConflict: "id" }
    )
    .select("*")
    .single();

  return data as Profile | null;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const fallbackProfile = profileFromUser(user);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const shouldBeAdmin = fallbackProfile.role === "admin";
  const shouldBeOrganizer = fallbackProfile.role === "organizer";

  if (data) {
    const profile = data as Profile;
    const needsUpgrade =
      (shouldBeAdmin && (profile.role !== "admin" || profile.organizer_status !== "approved")) ||
      (shouldBeOrganizer &&
        (profile.role !== "organizer" || profile.organizer_status !== "approved"));

    if (needsUpgrade) {
      try {
        const upgraded = await upsertProfileWithServiceRole({
          ...profile,
          role: fallbackProfile.role,
          organizer_status: fallbackProfile.organizer_status
        });
        if (upgraded) return upgraded;
      } catch {
        return {
          ...profile,
          role: fallbackProfile.role,
          organizer_status: fallbackProfile.organizer_status
        };
      }
    }

    return profile;
  }

  if (error) return fallbackProfile;

  try {
    const createdProfile = await upsertProfileWithServiceRole(fallbackProfile);
    return createdProfile || fallbackProfile;
  } catch {
    return fallbackProfile;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireProfile() {
  await requireUser();
  const profile = await getProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/events");
  return profile;
}

export async function requireOrganizer() {
  const profile = await requireProfile();
  if (profile.role !== "admin" && profile.role !== "organizer") {
    redirect("/events");
  }
  return profile;
}
