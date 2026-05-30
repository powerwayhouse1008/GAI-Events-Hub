"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signInEmail } from "./loginActions";

const initialState = {
  error: ""
};

function EmailLoginButton() {
  const { pending } = useFormStatus();

  return (
    <button disabled={pending} className="btn btn-primary w-full" type="submit">
      {pending ? "ログイン中..." : "ログイン"}
    </button>
  );
}

function getOAuthMessage(error: string | null) {
  if (error === "google_not_enabled") {
    return "Googleログインはまだ有効になっていません。SupabaseのAuthentication ProvidersでGoogleを有効にしてください。";
  }

  return "";
}

export function LoginForm() {
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/me";
  const oauthMessage = getOAuthMessage(params.get("oauth_error"));
  const [googleLoading, setGoogleLoading] = useState(false);
  const [state, formAction] = useActionState(signInEmail, initialState);

  function signInWithGoogle() {
    setGoogleLoading(true);
    window.location.href = `/auth/google?mode=login&next=${encodeURIComponent(redirectTo)}`;
  }

  return (
    <div className="mt-8">
      <button
        onClick={signInWithGoogle}
        disabled={googleLoading}
        type="button"
        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 font-black hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {googleLoading ? "Googleへ移動中..." : "Googleでログイン"}
      </button>

      {(oauthMessage || state.error) && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {oauthMessage || state.error}
        </p>
      )}

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        またはメール
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="label">
          メールアドレス
          <input className="input mt-2" name="email" type="email" required />
        </label>
        <label className="label">
          パスワード
          <input className="input mt-2" name="password" type="password" required />
        </label>
        <EmailLoginButton />
      </form>
    </div>
  );
}
