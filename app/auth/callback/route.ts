import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
        await supabase
          .from("profiles")
          .update({
            organizer_status: "pending",
            role: "member"
          })
          .eq("id", user.id);
      }

      return NextResponse.redirect(new URL("/organizer-pending", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
