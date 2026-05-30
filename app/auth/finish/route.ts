import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/events";
  if (path.startsWith("/login") || path.startsWith("/register")) return "/events";
  return path;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = getSafeRedirect(requestUrl.searchParams.get("next"));
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    const url = new URL("/login", requestUrl.origin);
    url.searchParams.set("auth_error", "session_missing");
    url.searchParams.set("redirectTo", next);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
