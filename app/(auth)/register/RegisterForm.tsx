"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type RequestedRole = "member" | "organizer";

function getSafeRedirect(path: string | null) {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/events";
  if (path.startsWith("/login") || path.startsWith("/register")) return "/events";
  return path;
}

function getRequestedRole(value: string | null): RequestedRole {
  return value === "organizer" ? "organizer" : "member";
}

function getOAuthMessage(error: string | null) {
  if (error === "google_not_enabled") {
    return "Google registration is not enabled. Please check the Supabase authentication provider settings.";
  }

  if (error === "oauth_exchange_failed") {
    return "Google registration could not be completed. Please check the Supabase redirect URL settings.";
  }

  return "";
}

function getEmailRedirectUrl(redirectTo: string, requestedRole: RequestedRole) {
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", redirectTo);
  callbackUrl.searchParams.set("requested_role", requestedRole);
  return callbackUrl.toString();
}

export function RegisterForm() {
  const params = useSearchParams();
  const redirectTo = getSafeRedirect(params.get("redirectTo") || params.get("next"));
  const initialRole = useMemo(() => getRequestedRole(params.get("requested_role")), [params]);
  const [requestedRole, setRequestedRole] = useState<RequestedRole>(initialRole);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [message, setMessage] = useState(getOAuthMessage(params.get("oauth_error")));

  function signUpWithGoogle() {
    setGoogleLoading(true);
    const query = new URLSearchParams({
      mode: "register",
      next: redirectTo,
      requested_role: requestedRole
    });
    window.location.href = `/auth/google?${query.toString()}`;
  }

  async function signUpWithEmail(formData: FormData) {
    setMessage("");
    setEmailLoading(true);

    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    const displayName = String(formData.get("display_name") || "");
    const companyName = String(formData.get("company_name") || "");
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectUrl(redirectTo, requestedRole),
        data: {
          display_name: displayName,
          full_name: displayName,
          company_name: companyName || null,
          requested_role: requestedRole
        }
      }
    });

    setEmailLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Registration started. Please check your email to confirm your account.");
  }

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setRequestedRole("member")}
          className={`rounded-lg px-4 py-3 text-sm font-black ${
            requestedRole === "member" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
          }`}
        >
          Member
        </button>
        <button
          type="button"
          onClick={() => setRequestedRole("organizer")}
          className={`rounded-lg px-4 py-3 text-sm font-black ${
            requestedRole === "organizer" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
          }`}
        >
          Organizer
        </button>
      </div>

      <button
        onClick={signUpWithGoogle}
        disabled={googleLoading || emailLoading}
        type="button"
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 font-black text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {googleLoading ? "Redirecting to Google..." : "Continue with Google"}
      </button>

      {message && <p className="mt-4 rounded-xl bg-cyan-50 p-3 text-sm font-bold text-cyan-900">{message}</p>}

      <div className="my-6 flex items-center gap-3 text-sm text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        or email
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={signUpWithEmail} className="grid gap-4">
        <label className="label">
          Display name
          <input className="input mt-2" name="display_name" type="text" required />
        </label>
        <label className="label">
          Company
          <input className="input mt-2" name="company_name" type="text" />
        </label>
        <label className="label">
          Email
          <input className="input mt-2" name="email" type="email" required />
        </label>
        <label className="label">
          Password
          <input className="input mt-2" name="password" type="password" minLength={6} required />
        </label>
        <button disabled={emailLoading || googleLoading} className="btn btn-primary w-full" type="submit">
          {emailLoading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
