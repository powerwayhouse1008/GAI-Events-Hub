import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function getSafePath(path: string | null, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.startsWith("/login") || path.startsWith("/register")) return fallback;
  return path;
}

function getOAuthErrorUrl(origin: string, mode: string) {
  const page = mode === "register" ? "/register" : "/login";
  const url = new URL(page, origin);
  url.searchParams.set("oauth_error", "google_not_enabled");
  return url;
}

function createOAuthClient(request: NextRequest) {
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

function redirectWithCookies(url: string | URL, cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
  const response = NextResponse.redirect(url);
  cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const mode = requestUrl.searchParams.get("mode") === "register" ? "register" : "login";
  const next = getSafePath(requestUrl.searchParams.get("next"), "/events");
  const requestedRole =
    requestUrl.searchParams.get("requested_role") === "organizer" ? "organizer" : "member";
  const origin = requestUrl.origin;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(getOAuthErrorUrl(origin, mode));
  }

  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", next);
  if (mode === "register") callbackUrl.searchParams.set("requested_role", requestedRole);

  const { supabase, cookiesToSet } = createOAuthClient(request);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });

  if (error || !data.url) {
    return redirectWithCookies(getOAuthErrorUrl(origin, mode), cookiesToSet);
  }

  return redirectWithCookies(data.url, cookiesToSet);
}
