"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getSafeRedirect(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/me";
  }

  if (path === "/" || path.startsWith("/login") || path.startsWith("/register")) {
    return "/me";
  }

  return path;
}

type SignInState = {
  error: string;
};

function getJapaneseAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }

  if (normalized.includes("email not confirmed")) {
    return "メール認証が完了していません。確認メールを開いて認証してください。";
  }

  if (normalized.includes("too many")) {
    return "ログイン試行回数が多すぎます。しばらく待ってから再度お試しください。";
  }

  return `ログインできませんでした。${message}`;
}

export async function signInEmail(
  _prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const redirectTo = getSafeRedirect(String(formData.get("redirectTo") || "/me"));

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error: getJapaneseAuthError(error.message) };
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

  redirect(redirectTo);
}
