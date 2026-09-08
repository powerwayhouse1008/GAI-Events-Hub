"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { footerLinkItems, normalizeFooterUrl, type FooterLinkMap } from "@/lib/footer-links";

export async function saveFooterLinks(links: FooterLinkMap) {
  await requireAdmin();

  const rows = footerLinkItems.map((item) => ({
    key: item.key,
    label: item.label,
    url: normalizeFooterUrl(links[item.key] || item.defaultUrl),
    updated_at: new Date().toISOString()
  }));

  const { error } = await createAdminClient().from("site_footer_links").upsert(rows, { onConflict: "key" });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/footer/[key]", "page");

  return { ok: true };
}
