"use client";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { saveFooterLinks } from "@/app/(main)/admin/footerLinkActions";
import { footerLinkItems, normalizeFooterUrl, type FooterLinkKey, type FooterLinkMap } from "@/lib/footer-links";

export function AdminLinkPanel({ initialLinks }: { initialLinks: FooterLinkMap }) {
  const [links, setLinks] = useState(initialLinks);
  const [activeKey, setActiveKey] = useState<FooterLinkKey>(footerLinkItems[0].key);
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const safeActiveUrl = useMemo(() => normalizeFooterUrl(links[activeKey] || ""), [activeKey, links]);

  async function saveLinks() {
    setSaving(true);
    const normalizedLinks = Object.fromEntries(Object.entries(links).map(([key, value]) => [key, normalizeFooterUrl(value)]));
    const result = await saveFooterLinks(normalizedLinks);
    setSaving(false);

    if (result.ok) {
      setLinks(normalizedLinks);
      setSavedMessage("保存しました");
      return;
    }

    setSavedMessage(`保存できませんでした: ${result.message}`);
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">リンク管理</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">Footer の各項目に Web リンクを割り当てて保存できます。</p>
        </div>
        <button className="btn btn-primary" disabled={saving} onClick={saveLinks} type="button">
          <Save size={17} /> {saving ? "保存中..." : "保存"}
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
