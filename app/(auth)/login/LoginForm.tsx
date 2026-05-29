"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function LoginForm() {
  const supabase = createClient();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") || "/events";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setLoading(true);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
      }
    });
  }

  async function signInEmail(formData: FormData) {
    setLoading(true);
    setError("");
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    window.location.href = redirectTo;
  }

  return (
    <div className="mt-8">
      <button
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-4 font-black hover:bg-slate-50"
      >
        Googleでログイン
      </button>

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        またはメール
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={signInEmail} className="grid gap-4">
        <label className="label">Email<input className="input mt-2" name="email" type="email" required /></label>
        <label className="label">Password<input className="input mt-2" name="password" type="password" required /></label>
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        <button disabled={loading} className="btn btn-primary w-full" type="submit">ログイン</button>
      </form>
    </div>
  );
}
