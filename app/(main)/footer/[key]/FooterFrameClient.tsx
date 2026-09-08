"use client";

import { ExternalLink } from "lucide-react";
import { useMemo } from "react";
import { footerLinkItems, normalizeFooterUrl, type FooterLinkKey } from "@/lib/footer-links";

type FooterFrameClientProps = {
  linkKey: FooterLinkKey;
  url: string;
};

export function FooterFrameClient({ linkKey, url }: FooterFrameClientProps) {
  const item = footerLinkItems.find((link) => link.key === linkKey) || footerLinkItems[0];
  const safeUrl = useMemo(() => normalizeFooterUrl(url || item.defaultUrl), [item.defaultUrl, url]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black tracking-tight text-slate-950">{item.label}</h1>
        <a className="btn border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" href={safeUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={17} /> Open in new tab
        </a>
      </div>
      <iframe title={item.label} src={safeUrl} className="h-[calc(100vh-260px)] min-h-[620px] w-full rounded-xl border border-slate-200 bg-white shadow-sm" />
    </main>
  );
}
