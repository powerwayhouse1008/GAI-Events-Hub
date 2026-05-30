import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/events";
  if (path.startsWith("/login") || path.startsWith("/register")) return "/events";
  return path;
}

function getAuthErrorCode(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) return "invalid";
  if (normalized.includes("email not confirmed")) return "email_not_confirmed";
  if (normalized.includes("too many")) return "too_many";
  return "unknown";
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") || "/events"));
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    const url = new URL("/login", requestUrl.origin);
    url.searchParams.set("auth_error", getAuthErrorCode(error.message));
    url.searchParams.set("redirectTo", redirectTo);
    return NextResponse.redirect(url, { status: 303 });
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
        role: user.user_metadata?.requested_role === "organizer" ? "organizer" : "member",
        organizer_status: user.user_metadata?.requested_role === "organizer" ? "approved" : "none"
      });
    }
  }

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin), { status: 303 });
}
