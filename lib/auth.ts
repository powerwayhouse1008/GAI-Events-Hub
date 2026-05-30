import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const configuredAdminEmail = (process.env.ADMIN_EMAIL || "mai@powerway.jp").toLowerCase();
  const isConfiguredAdmin = user.email?.toLowerCase() === configuredAdminEmail;
  const fallbackProfile: Profile = {
    id: user.id,
    email: user.email || null,
    display_name:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "User",
    avatar_url: user.user_metadata?.avatar_url || null,
    company_name: user.user_metadata?.company_name || null,
    role: isConfiguredAdmin ? "admin" : "member",
    organizer_status: isConfiguredAdmin
      ? "approved"
      : user.user_metadata?.requested_role === "organizer"
        ? "pending"
        : "none",
    created_at: user.created_at
  };

  if (isConfiguredAdmin) {
    try {
      const admin = createAdminClient();
      const { data: adminProfile } = await admin
        .from("profiles")
        .upsert({
          id: user.id,
          email: user.email,
          display_name:
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "Admin",
          avatar_url: user.user_metadata?.avatar_url || null,
          company_name: user.user_metadata?.company_name || null,
          role: "admin",
          organizer_status: "approved"
        })
        .select("*")
        .single();

      if (adminProfile) return adminProfile as Profile;
    } catch {
      return fallbackProfile;
    }
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    if (
      user.user_metadata?.requested_role === "organizer" &&
      data.role === "member" &&
      (data.organizer_status === "none" || data.organizer_status === "rejected")
    ) {
      try {
        const admin = createAdminClient();
        const { data: updatedProfile } = await admin
          .from("profiles")
          .update({ organizer_status: "pending" })
          .eq("id", user.id)
          .select("*")
          .single();

        if (updatedProfile) return updatedProfile as Profile;
      } catch {
        return { ...(data as Profile), organizer_status: "pending" };
      }
    }

    return data as Profile;
  }

  if (error) {
    return fallbackProfile;
  }

  const requestedRole = user.user_metadata?.requested_role;
  const { data: createdProfile } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      display_name:
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User",
      avatar_url: user.user_metadata?.avatar_url || null,
      company_name: user.user_metadata?.company_name || null,
      role: "member",
      organizer_status: requestedRole === "organizer" ? "pending" : "none"
    })
    .select("*")
    .single();

  return (createdProfile as Profile | null) || fallbackProfile;
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
    redirect("/organizer-pending");
  }
  if (profile.role === "organizer" && profile.organizer_status !== "approved") {
    redirect("/organizer-pending");
  }
  return profile;
}
