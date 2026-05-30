import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/events";
  const requestedRole = requestUrl.searchParams.get("requested_role");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    if (requestedRole === "organizer") {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        const admin = createAdminClient();
        await admin
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            display_name:
              user.user_metadata?.display_name ||
              user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User",
            avatar_url: user.user_metadata?.avatar_url || null,
            company_name: user.user_metadata?.company_name || null,
            organizer_status: "pending",
            role: "member"
          });
      }

      return NextResponse.redirect(new URL("/organizer-pending", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
