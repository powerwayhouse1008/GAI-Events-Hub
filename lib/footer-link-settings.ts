import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { footerLinkItems, mergeFooterLinks, type FooterLinkMap } from "@/lib/footer-links";

export const getFooterLinks = cache(async (): Promise<FooterLinkMap> => {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("site_footer_links").select("key,url");

    if (error || !data) return mergeFooterLinks(null);

    return mergeFooterLinks(
      Object.fromEntries(
        data
          .filter((item) => footerLinkItems.some((link) => link.key === item.key))
          .map((item) => [item.key, item.url])
      )
    );
  } catch {
    return mergeFooterLinks(null);
  }
});
