"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

function getSafeRedirect(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/events";
  if (path.startsWith("/login") || path.startsWith("/register")) return "/events";
  return path;
}

function getOAuthMessage(error: string | null) {
  if (error === "google_not_enabled") {
    return "Googleログインはまだ有効になっていません。SupabaseのAuthentication ProvidersでGoogleを有効にしてください。";
  }

  return "";
}

function getEmailMessage(error: string | null) {
  if (error === "invalid") return "メールアドレスまたはパスワードが正しくありません。";
  if (error === "email_not_confirmed") {
    return "メール認証が完了していません。確認メールを開いて認証してください。";
  }
  if (error === "too_many") {
    return "ログイン試行回数が多すぎます。しばらく待ってから再度お試しください。";
  }
  if (error === "unknown") return "ログインできませんでした。入力内容を確認してください。";
  return "";
}

export function LoginForm() {
  const params = useSearchParams();
  const redirectTo = getSafeRedirect(params.get("redirectTo"));
  const message = getOAuthMessage(params.get("oauth_error")) || getEmailMessage(params.get("auth_error"));
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  function signInWithGoogle() {
    setGoogleLoading(true);
    window.location.href = `/auth/google?mode=login&next=${encodeURIComponent(redirectTo)}`;
  }

  return (
    <div className="mt-8">
      <button
        onClick={signInWithGoogle}
        disabled={googleLoading || emailLoading}
        type="button"
        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 font-black hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {googleLoading ? "Googleへ移動中..." : "Googleでログイン"}
      </button>

      {message && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {message}
        </p>
      )}

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        またはメール
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form
        action="/auth/login"
        method="post"
        className="grid gap-4"
        onSubmit={() => setEmailLoading(true)}
      >
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="label">
          メールアドレス
          <input className="input mt-2" name="email" type="email" required />
        </label>
        <label className="label">
          パスワード
          <input className="input mt-2" name="password" type="password" required />
        </label>
        <button disabled={emailLoading || googleLoading} className="btn btn-primary w-full" type="submit">
          {emailLoading ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
