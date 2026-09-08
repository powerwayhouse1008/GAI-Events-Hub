import { notFound, redirect } from "next/navigation";
import { footerLinkItems, normalizeFooterUrl } from "@/lib/footer-links";
import { getFooterLinks } from "@/lib/footer-link-settings";

export default async function FooterFramePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const item = footerLinkItems.find((link) => link.key === key);
  if (!item) notFound();
  const links = await getFooterLinks();

  redirect(normalizeFooterUrl(links[item.key] || item.defaultUrl));
}
