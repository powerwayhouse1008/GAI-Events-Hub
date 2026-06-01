import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { setAppSessionCookie } from "@/lib/app-session";

function getSafePath(path: string | null, fallback = "/events") {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path === "/" || path.startsWith("/login") || path.startsWith("/register")) return fallback;
  return path;
}

function getOAuthErrorRedirect(origin: string, requestedRole: string | null, code = "google_not_enabled") {
  const fallback = requestedRole ? "/register" : "/login";
  const url = new URL(fallback, origin);
  url.searchParams.set("oauth_error", code);
  return url;
}

function getProfilePayload(user: any, requestedRole: string | null) {
  const isOrganizer = requestedRole === "organizer";
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
    organizer_status: isOrganizer ? "approved" : "none",
    role: isOrganizer ? "organizer" : "member"
  };
}

async function syncOAuthProfile(supabase: Awaited<ReturnType<typeof createClient>>, user: any, requestedRole: string | null) {
  const payload = getProfilePayload(user, requestedRole);

  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("profiles")
      .select("role, organizer_status")
      .eq("id", user.id)
      .maybeSingle();

    const shouldPreserveRole = requestedRole !== "organizer" && existing;
    await admin.from("profiles").upsert(
      {
        ...payload,
        role: shouldPreserveRole ? existing.role : payload.role,
        organizer_status: shouldPreserveRole ? existing.organizer_status : payload.organizer_status
      },
      { onConflict: "id" }
    );
    return;
  } catch {
    // Fall back to the user's own RLS-limited profile insert/update when the
    // service role key is not configured. This keeps Google login usable.
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: payload.id,
      email: payload.email,
      display_name: payload.display_name,
      avatar_url: payload.avatar_url,
      company_name: payload.company_name,
      role: "member",
      organizer_status: requestedRole === "organizer" ? "pending" : "none"
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("OAuth profile fallback sync failed:", error.message);
  }
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafePath(requestUrl.searchParams.get("next"));
  const requestedRole = requestUrl.searchParams.get("requested_role");
  const oauthError = requestUrl.searchParams.get("error") || requestUrl.searchParams.get("error_code");

  if (oauthError) {
    return NextResponse.redirect(getOAuthErrorRedirect(requestUrl.origin, requestedRole));
  }

  if (!code) {
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = getOAuthErrorRedirect(requestUrl.origin, requestedRole, "oauth_exchange_failed");
    url.searchParams.set("detail", error.message.slice(0, 120));
    return NextResponse.redirect(url);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    await syncOAuthProfile(supabase, user, requestedRole);
  }

  const response = NextResponse.redirect(new URL(requestedRole === "organizer" ? "/events" : next, requestUrl.origin));
  if (user) setAppSessionCookie(response, user.id);
  return response;
}
