"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { getLanguage, languages, translatePhrase, type LanguageCode } from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();
const originalPlaceholder = new WeakMap<HTMLInputElement | HTMLTextAreaElement, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatableAttributes = ["aria-label", "title"] as const;
let isApplyingTranslations = false;

function applyTranslations(language: LanguageCode) {
  isApplyingTranslations = true;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("[data-no-translate],script,style,textarea,noscript")) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
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
    if (field.closest("[data-no-translate]")) return;
    if (!originalPlaceholder.has(field)) originalPlaceholder.set(field, field.placeholder);
    const nextPlaceholder = translatePhrase(originalPlaceholder.get(field) || "", language);
    if (field.placeholder !== nextPlaceholder) field.placeholder = nextPlaceholder;
  });

  const attributeElements = document.querySelectorAll<HTMLElement>(
    translatableAttributes.map((attribute) => `[${attribute}]`).join(",")
  );
  attributeElements.forEach((element) => {
    if (element.closest("[data-no-translate]")) return;
    if (!originalAttributes.has(element)) originalAttributes.set(element, new Map());
    const originals = originalAttributes.get(element)!;

    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value?.trim()) return;
      if (!originals.has(attribute)) originals.set(attribute, value);
      const nextValue = translatePhrase(originals.get(attribute) || "", language);
      if (value !== nextValue) element.setAttribute(attribute, nextValue);
    });
  });

  window.requestAnimationFrame(() => {
    isApplyingTranslations = false;
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") return "ja";
    return getLanguage(window.localStorage.getItem("site-language"));
  });

  useEffect(() => {
    const htmlLang = languages.find((item) => item.code === language)?.htmlLang || "ja";
    let frame = 0;

    const scheduleTranslations = () => {
      if (isApplyingTranslations || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyTranslations(language);
      });
    };

    document.documentElement.lang = htmlLang;
    document.documentElement.dataset.language = language;
    window.localStorage.setItem("site-language", language);
    scheduleTranslations();

    const observer = new MutationObserver(scheduleTranslations);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
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
  const [open, setOpen] = useState(false);
  const activeLanguage = languages.find((item) => item.code === language) || languages[0];

  return (
    <aside
      className="fixed bottom-4 right-4 z-[100] w-32 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-xl shadow-slate-900/15 backdrop-blur"
      aria-label={translatePhrase("Language", language)}
      data-no-translate
    >
      {open && (
        <div className="absolute bottom-[calc(100%+0.5rem)] right-0 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/15 backdrop-blur">
          <div className="max-h-52 overflow-y-auto pr-0.5">
            {languages.map((item) => {
              const selected = item.code === language;

              return (
                <button
                  key={item.code}
                  type="button"
                  className={`flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-bold transition ${
                    selected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                  aria-pressed={selected}
                  onClick={() => {
                    setLanguage(item.code);
                    setOpen(false);
                  }}
                >
                  <span>{item.label}</span>
                  {selected && <Check size={14} aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl px-3 text-sm font-black text-slate-800 transition hover:bg-slate-100"
        aria-expanded={open}
        aria-label={translatePhrase("Language", language)}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-2">
          <Languages size={16} aria-hidden="true" />
          {activeLanguage.shortLabel}
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
    </aside>
  );
}
