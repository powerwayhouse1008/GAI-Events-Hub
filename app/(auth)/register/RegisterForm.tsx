"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function getRegisterErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("database error saving new user")) {
    return "アカウント作成時にデータベースエラーが発生しました。管理者に連絡してください。";
  }

  if (normalized.includes("already registered") || normalized.includes("already")) {
    return "このメールアドレスはすでに登録されています。ログインしてください。";
  }

  if (normalized.includes("password")) {
    return "パスワードを確認してください。6文字以上で入力してください。";
  }

  return "登録できませんでした。入力内容を確認してください。";
}

function getOAuthMessage(error: string | null) {
  if (error === "google_not_enabled") {
    return "Google登録はまだ有効になっていません。SupabaseのAuthentication ProvidersでGoogleを有効にしてください。";
  }

  return "";
}

export function RegisterForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const [error, setError] = useState(getOAuthMessage(params.get("oauth_error")));
  const [loading, setLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState("member");

  async function activateOrganizer(email: string, displayName: string, companyName: string) {
    await fetch("/auth/request-organizer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName, companyName })
    });
  }

  async function signUp(formData: FormData) {
    setLoading(true);
    setError("");

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const displayName = String(formData.get("display_name") || "");
    const companyName = String(formData.get("company_name") || "");
    const requestedRole = String(formData.get("requested_role") || "member");
    const siteUrl = getSiteUrl();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          company_name: companyName,
          requested_role: requestedRole
        },
        emailRedirectTo: `${siteUrl}/auth/callback?requested_role=${requestedRole}`
      }
    });

    if (error) {
      setError(getRegisterErrorMessage(error.message));
      setLoading(false);
      return;
    }

    if (requestedRole === "organizer") {
      await activateOrganizer(email, displayName, companyName);
    }

    window.location.href = "/events";
  }

  function signUpWithGoogle() {
    setLoading(true);
    window.location.href = `/auth/google?mode=register&requested_role=${googleRole}`;
  }

  return (
    <div className="mt-8">
      <label className="label">
        Google登録のアカウント種別
        <select
          className="input mt-2"
          value={googleRole}
          onChange={(event) => setGoogleRole(event.target.value)}
        >
          <option value="member">Member / 参加者</option>
          <option value="organizer">Organizer / 主催者</option>
        </select>
      </label>

      <button
        onClick={signUpWithGoogle}
        disabled={loading}
        type="button"
        className="mt-4 flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 font-black hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Googleへ移動中..." : "Googleで登録"}
      </button>

      {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        またはメール
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={signUp} className="grid gap-4">
        <label className="label">
          名前
          <input className="input mt-2" name="display_name" required />
        </label>
        <label className="label">
          メールアドレス
          <input className="input mt-2" name="email" type="email" required />
        </label>
        <label className="label">
          パスワード
          <input className="input mt-2" name="password" type="password" minLength={6} required />
        </label>
        <label className="label">
          会社・コミュニティ
          <input className="input mt-2" name="company_name" />
        </label>
        <label className="label">
          アカウント種別
          <select className="input mt-2" name="requested_role">
            <option value="member">Member / 参加者</option>
            <option value="organizer">Organizer / 主催者</option>
          </select>
        </label>
        <button disabled={loading} className="btn btn-primary w-full" type="submit">
          {loading ? "作成中..." : "アカウント作成"}
        </button>
      </form>
    </div>
  );
}
