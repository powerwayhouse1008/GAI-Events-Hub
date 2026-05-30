"use client";

import { createClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site-url";
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
      ログイン
    </button>
  );
}

export function LoginForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/events";
  const [googleLoading, setGoogleLoading] = useState(false);
  const [state, formAction] = useActionState(signInEmail, initialState);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const siteUrl = getSiteUrl();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      }
    });
  }

  return (
    <div className="mt-8">
      <button
        onClick={signInWithGoogle}
        disabled={googleLoading}
        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 font-black hover:bg-slate-50"
      >
        Googleでログイン
      </button>

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        またはメール
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="grid gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="label">
          Email
          <input className="input mt-2" name="email" type="email" required />
        </label>
        <label className="label">
          Password
          <input className="input mt-2" name="password" type="password" required />
        </label>
        {state.error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
            {state.error}
          </p>
        )}
        <EmailLoginButton />
      </form>
    </div>
  );
}
