"use client";

import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/components/LanguageProvider";

export function LogoutButton() {
  const { t } = useLanguage();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button onClick={logout} className="hidden rounded-full bg-slate-100 px-4 py-2 text-sm font-bold md:block">
      {t("Logout")}
    </button>
  );
}
