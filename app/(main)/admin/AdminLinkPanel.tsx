"use client";

import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";

const defaultLinks = [
  { label: "会社情報", url: "https://www.accenture.com/jp-ja/about/company-index" },
  { label: "お知らせ", url: "https://www.accenture.com/jp-ja/about/newsroom" },
  { label: "お問い合わせ", url: "https://www.accenture.com/jp-ja/about/contact-us" }
];

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function AdminLinkPanel() {
  const [links, setLinks] = useState(defaultLinks);
  const [activeUrl, setActiveUrl] = useState(defaultLinks[0].url);
  const safeActiveUrl = useMemo(() => normalizeUrl(activeUrl), [activeUrl]);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">リンク管理</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">各項目にWebリンクを割り当て、ページ内で確認できます。</p>
        </div>
        <a className="btn border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" href={safeActiveUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={17} /> 新しいタブで開く
        </a>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="grid gap-3">
          {links.map((link, index) => (
            <label key={link.label} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
              <span>{link.label}</span>
              <input
                className="input bg-white"
                value={link.url}
                onChange={(event) => {
                  const nextLinks = [...links];
                  nextLinks[index] = { ...link, url: event.target.value };
                  setLinks(nextLinks);
                }}
                onFocus={() => setActiveUrl(link.url)}
                placeholder="https://example.com"
                type="url"
              />
              <button className="btn min-h-10 border border-slate-200 bg-white py-2 text-slate-700 hover:bg-slate-100" onClick={() => setActiveUrl(link.url)} type="button">
                ページ内で開く
              </button>
            </label>
          ))}
        </div>
        <iframe title="リンクプレビュー" src={safeActiveUrl} className="h-[640px] w-full rounded-xl border border-slate-200 bg-white" />
      </div>
    </section>
  );
}
