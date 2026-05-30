import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

function createLoginClient(request: NextRequest) {
  const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(items: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.push(...items);
        }
      }
    }
  );

  return { supabase, cookiesToSet };
}

function redirectWithCookies(url: URL, cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
  const response = NextResponse.redirect(url, { status: 303 });
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  return response;
}

export async function POST(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") || "/events"));
  const { supabase, cookiesToSet } = createLoginClient(request);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    const url = new URL("/login", requestUrl.origin);
    url.searchParams.set("auth_error", getAuthErrorCode(error.message));
    url.searchParams.set("redirectTo", redirectTo);
    return redirectWithCookies(url, cookiesToSet);
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

  const finishUrl = new URL("/auth/finish", requestUrl.origin);
  finishUrl.searchParams.set("next", redirectTo);
  return redirectWithCookies(finishUrl, cookiesToSet);
}
