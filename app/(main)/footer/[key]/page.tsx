import { notFound } from "next/navigation";
import { footerLinkItems, type FooterLinkKey } from "@/lib/footer-links";
import { getFooterLinks } from "@/lib/footer-link-settings";
import { FooterFrameClient } from "./FooterFrameClient";

export default async function FooterFramePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const item = footerLinkItems.find((link) => link.key === key);
  if (!item) notFound();
  const links = await getFooterLinks();

  return <FooterFrameClient linkKey={key as FooterLinkKey} url={links[item.key] || item.defaultUrl} />;
}
