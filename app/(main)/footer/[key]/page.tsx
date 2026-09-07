import { notFound } from "next/navigation";
import { footerLinkItems, type FooterLinkKey } from "@/lib/footer-links";
import { FooterFrameClient } from "./FooterFrameClient";

export default async function FooterFramePage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const item = footerLinkItems.find((link) => link.key === key);
  if (!item) notFound();

  return <FooterFrameClient linkKey={key as FooterLinkKey} />;
}
