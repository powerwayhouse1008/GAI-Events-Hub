"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, Languages } from "lucide-react";
import { getLanguage, languages, translatePhrase, type LanguageCode } from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();
const originalPlaceholder = new WeakMap<HTMLInputElement | HTMLTextAreaElement, string>();

function applyTranslations(language: LanguageCode) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("[data-no-translate],script,style,textarea")) return NodeFilter.FILTER_REJECT;
      if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    if (!originalText.has(node)) originalText.set(node, node.textContent || "");
    const nextText = translatePhrase(originalText.get(node) || "", language);
    if (node.textContent !== nextText) node.textContent = nextText;
  }

  const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input[placeholder], textarea[placeholder]");
  fields.forEach((field) => {
    if (!originalPlaceholder.has(field)) originalPlaceholder.set(field, field.placeholder);
    const nextPlaceholder = translatePhrase(originalPlaceholder.get(field) || "", language);
    if (field.placeholder !== nextPlaceholder) field.placeholder = nextPlaceholder;
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "ja";
    return getLanguage(window.localStorage.getItem("site-language"));
  });

  useEffect(() => {
    const htmlLang = languages.find((item) => item.code === language)?.htmlLang || "ja";
    document.documentElement.lang = htmlLang;
    document.documentElement.dataset.language = language;
    window.localStorage.setItem("site-language", language);
    applyTranslations(language);

    const observer = new MutationObserver(() => applyTranslations(language));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: LanguageCode) => setLanguageState(nextLanguage)
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <LanguageSwitcher />
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <aside
      className="fixed bottom-4 right-4 z-[100] w-[min(calc(100vw-2rem),360px)] rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-900/20 backdrop-blur"
      aria-label={translatePhrase("Language", language)}
      data-no-translate
    >
      <div className="mb-2 flex items-center gap-2 px-2 text-xs font-black uppercase tracking-wider text-slate-500">
        <Languages size={16} aria-hidden="true" />
        <span>{translatePhrase("Language", language)}</span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {languages.map((item) => {
          const selected = item.code === language;

          return (
            <button
              key={item.code}
              type="button"
              className={`flex min-h-11 items-center justify-center gap-1 rounded-xl px-2 text-sm font-black transition ${
                selected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-pressed={selected}
              aria-label={item.label}
              onClick={() => setLanguage(item.code)}
            >
              {selected && <Check size={14} aria-hidden="true" />}
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
