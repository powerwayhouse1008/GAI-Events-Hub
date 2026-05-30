import { NextResponse } from "next/server";

function getSafePath(path: string | null, fallback: string) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

function getOAuthErrorUrl(origin: string, mode: string) {
  const page = mode === "register" ? "/register" : "/login";
  const url = new URL(page, origin);
  url.searchParams.set("oauth_error", "google_not_enabled");
  return url;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const mode = requestUrl.searchParams.get("mode") === "register" ? "register" : "login";
  const next = getSafePath(requestUrl.searchParams.get("next"), "/events");
  const requestedRole =
    requestUrl.searchParams.get("requested_role") === "organizer" ? "organizer" : "member";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(getOAuthErrorUrl(requestUrl.origin, mode));
  }

  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  if (mode === "register") {
    callbackUrl.searchParams.set("requested_role", requestedRole);
  } else {
    callbackUrl.searchParams.set("next", next);
  }

  const authorizeUrl = new URL("/auth/v1/authorize", supabaseUrl);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", callbackUrl.toString());

  try {
    const response = await fetch(authorizeUrl, {
      headers: {
        apikey: anonKey
      },
      redirect: "manual",
      cache: "no-store"
    });

    const location = response.headers.get("location");
    if (location && response.status >= 300 && response.status < 400) {
      return NextResponse.redirect(location);
    }

    return NextResponse.redirect(getOAuthErrorUrl(requestUrl.origin, mode));
  } catch {
    return NextResponse.redirect(getOAuthErrorUrl(requestUrl.origin, mode));
  }
}
