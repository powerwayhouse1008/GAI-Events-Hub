import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { email, displayName, companyName } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "メールアドレスがありません。" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const user = users.users.find(
    (candidate) => candidate.email?.toLowerCase() === String(email).toLowerCase()
  );

  if (!user) {
    return NextResponse.json({ error: "ユーザーが見つかりません。" }, { status: 404 });
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      display_name:
        displayName ||
        user.user_metadata?.display_name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User",
      avatar_url: user.user_metadata?.avatar_url || null,
      company_name: companyName || user.user_metadata?.company_name || null,
      role: "organizer",
      organizer_status: "approved"
    },
    { onConflict: "id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
