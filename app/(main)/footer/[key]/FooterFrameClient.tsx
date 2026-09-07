"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { footerLinkItems, footerLinkStorageKey, type FooterLinkKey } from "@/lib/footer-links";

type FooterFrameClientProps = {
  linkKey: FooterLinkKey;
};

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function FooterFrameClient({ linkKey }: FooterFrameClientProps) {
  const item = footerLinkItems.find((link) => link.key === linkKey) || footerLinkItems[0];
  const [url, setUrl] = useState<string>(item.defaultUrl);
  const safeUrl = useMemo(() => normalizeUrl(url), [url]);

  useEffect(() => {
    const saved = window.localStorage.getItem(footerLinkStorageKey);
    if (!saved) return;

    try {
      const links = JSON.parse(saved) as Record<string, string>;
      setUrl(links[item.key] || item.defaultUrl);
    } catch {
      setUrl(item.defaultUrl);
    }
  }, [item.defaultUrl, item.key]);

  return (
    <main className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-black tracking-tight text-slate-950">{item.label}</h1>
        <a className="btn border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" href={safeUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={17} /> 新しいタブで開く
        </a>
      </div>
      <iframe title={item.label} src={safeUrl} className="h-[calc(100vh-260px)] min-h-[620px] w-full rounded-xl border border-slate-200 bg-white shadow-sm" />
    </main>
  );
}
