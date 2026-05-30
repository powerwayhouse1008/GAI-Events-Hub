"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/events";
  }

  if (path.startsWith("/login")) {
    return "/events";
  }

  return path;
}

export async function signInEmail(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") || "/events"));

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
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
        organizer_status: "none"
      });
    }
  }

  redirect(redirectTo);
}
