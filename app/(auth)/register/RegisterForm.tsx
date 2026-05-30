"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
import { useState } from "react";

export function RegisterForm() {
  const supabase = createClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        emailRedirectTo: `${siteUrl}/auth/callback`
      }
    });

    if (error) {
      setError("登録できませんでした。入力内容を確認してください。");
      setLoading(false);
      return;
    }

    window.location.href = requestedRole === "organizer" ? "/organizer-pending" : "/events";
  }

  async function signUpGoogleOrganizer() {
    const siteUrl = getSiteUrl();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?requested_role=organizer`
      }
    });
  }

  return (
    <div className="mt-8">
      <button
        onClick={signUpGoogleOrganizer}
        type="button"
        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 font-black hover:bg-slate-50"
      >
        Googleで登録
      </button>

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        またはメール
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={signUp} className="grid gap-4">
        <label className="label">名前<input className="input mt-2" name="display_name" required /></label>
        <label className="label">メールアドレス<input className="input mt-2" name="email" type="email" required /></label>
        <label className="label">パスワード<input className="input mt-2" name="password" type="password" minLength={6} required /></label>
        <label className="label">会社・コミュニティ<input className="input mt-2" name="company_name" /></label>
        <label className="label">
          アカウント種別
          <select className="input mt-2" name="requested_role">
            <option value="member">Member / 参加者</option>
            <option value="organizer">Organizer / 主催者申請</option>
          </select>
        </label>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button disabled={loading} className="btn btn-primary w-full" type="submit">
          {loading ? "作成中..." : "アカウント作成"}
        </button>
      </form>
    </div>
  );
}
