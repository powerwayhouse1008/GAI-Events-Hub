import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function getSafePath(path: string | null, fallback = "/events") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  return path;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafePath(requestUrl.searchParams.get("next"));
  const requestedRole = requestUrl.searchParams.get("requested_role");
  const oauthError = requestUrl.searchParams.get("error") || requestUrl.searchParams.get("error_code");

  if (oauthError) {
    const fallback = requestedRole ? "/register" : "/login";
    const url = new URL(fallback, requestUrl.origin);
    url.searchParams.set("oauth_error", "google_not_enabled");
    return NextResponse.redirect(url);
  }

  if (!code) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const fallback = requestedRole ? "/register" : "/login";
    const url = new URL(fallback, requestUrl.origin);
    url.searchParams.set("oauth_error", "google_not_enabled");
    return NextResponse.redirect(url);
  }

  if (requestedRole === "organizer") {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createAdminClient();
      await admin.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          display_name:
            user.user_metadata?.display_name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          avatar_url: user.user_metadata?.avatar_url || null,
          company_name: user.user_metadata?.company_name || null,
          organizer_status: "approved",
          role: "organizer"
        },
        { onConflict: "id" }
      );
    }

    return NextResponse.redirect(new URL("/events", requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
