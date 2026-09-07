"use client";

import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { footerLinkItems, footerLinkStorageKey, type FooterLinkKey } from "@/lib/footer-links";

type FooterLinkMap = Record<string, string>;

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function getDefaultLinks(): FooterLinkMap {
  return Object.fromEntries(footerLinkItems.map((item) => [item.key, item.defaultUrl]));
}

export function AdminLinkPanel() {
  const [links, setLinks] = useState<FooterLinkMap>(getDefaultLinks);
  const [activeKey, setActiveKey] = useState<FooterLinkKey>(footerLinkItems[0].key);
  const [savedMessage, setSavedMessage] = useState("");
  const safeActiveUrl = useMemo(() => normalizeUrl(links[activeKey] || ""), [activeKey, links]);

  useEffect(() => {
    const saved = window.localStorage.getItem(footerLinkStorageKey);
    if (saved) {
      try {
        setLinks({ ...getDefaultLinks(), ...(JSON.parse(saved) as FooterLinkMap) });
      } catch {
        setLinks(getDefaultLinks());
      }
    }
  }, []);

  function saveLinks() {
    const normalizedLinks = Object.fromEntries(Object.entries(links).map(([key, value]) => [key, normalizeUrl(value)]));
    setLinks(normalizedLinks);
    window.localStorage.setItem(footerLinkStorageKey, JSON.stringify(normalizedLinks));
    setSavedMessage("保存しました");
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">リンク管理</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">Footerの各項目にWebリンクを割り当てて保存できます。</p>
        </div>
        <button className="btn btn-primary" onClick={saveLinks} type="button">
          <Save size={17} /> 保存
        </button>
      </div>

      {savedMessage && <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">{savedMessage}</p>}

      <div className="mt-5 grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="grid gap-3">
          {footerLinkItems.map((item) => (
            <label key={item.key} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
              <span>{item.label}</span>
              <input
                className="input bg-white"
                value={links[item.key] || ""}
                onChange={(event) => {
                  setLinks((current) => ({ ...current, [item.key]: event.target.value }));
                  setSavedMessage("");
                }}
                onFocus={() => setActiveKey(item.key)}
                placeholder="https://example.com"
                type="url"
              />
            </label>
          ))}
        </div>
        <iframe title="リンクプレビュー" src={safeActiveUrl} className="h-[640px] w-full rounded-xl border border-slate-200 bg-white" />
      </div>
    </section>
  );
}
