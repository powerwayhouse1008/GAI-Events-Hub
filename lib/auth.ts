import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    return data as Profile;
  }

  if (error) {
    return null;
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

  return createdProfile as Profile | null;
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
