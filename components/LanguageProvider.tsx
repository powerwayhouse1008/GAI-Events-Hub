"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { getLanguage, type LanguageCode } from "@/lib/i18n";

declare global {
  interface Window {
    Translator?: {
      availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<"available" | "downloadable" | "downloading" | "unavailable">;
      create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<{
        translate: (text: string) => Promise<string>;
        destroy?: () => void;
      }>;
    };
  }
}

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

type TranslatableField = HTMLInputElement | HTMLTextAreaElement;

const languageOptions: Array<{ code: LanguageCode; label: string; shortLabel: string; htmlLang: string }> = [
  { code: "ja", label: "日本語", shortLabel: "JP", htmlLang: "ja" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en" },
  { code: "zh", label: "中文", shortLabel: "ZH", htmlLang: "zh-CN" },
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", htmlLang: "vi" }
];

const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();
const originalPlaceholder = new WeakMap<TranslatableField, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatableAttributes = ["aria-label", "title"] as const;

function getStoredLanguage() {
  if (typeof window === "undefined") return "ja";
  return getLanguage(window.localStorage.getItem("site-language"));
}

function cacheKey(language: LanguageCode, text: string) {
  return `gai-translation:${language}:${encodeURIComponent(text).slice(0, 700)}`;
}

function canTranslateText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !/^[\d\s:./+\-,()]+$/.test(trimmed);
}

function collectTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("[data-no-translate],script,style,textarea,noscript,code,pre")) return NodeFilter.FILTER_REJECT;
      if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
      if (!canTranslateText(node.textContent || "")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

async function translateBatch(texts: string[], language: LanguageCode) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target: language, source: "ja" })
  });

  if (!response.ok) return texts;
  const data = (await response.json()) as { translations?: string[]; missing?: string[] };
  const cachedTranslations = data.translations?.length === texts.length ? data.translations : texts;
  const missing = data.missing || [];

  if (!missing.length || !window.Translator) return cachedTranslations;

  const availability = await window.Translator.availability({
    sourceLanguage: "ja",
    targetLanguage: language === "zh" ? "zh" : language
  });

  if (availability === "unavailable") return cachedTranslations;

  const translator = await window.Translator.create({
    sourceLanguage: "ja",
    targetLanguage: language === "zh" ? "zh" : language
  });

  try {
    const translatedMissing = await Promise.all(missing.map((text) => translator.translate(text).catch(() => text)));
    await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: missing, translations: translatedMissing, target: language, source: "ja" })
    }).catch(() => null);

    const translatedByText = new Map(missing.map((text, index) => [text, translatedMissing[index] || text]));
    return texts.map((text, index) => (missing.includes(text) ? translatedByText.get(text) || text : cachedTranslations[index] || text));
  } finally {
    translator.destroy?.();
  }
}

async function ensureTranslations(texts: string[], language: LanguageCode) {
  const missing = [...new Set(texts.filter((text) => canTranslateText(text) && !window.localStorage.getItem(cacheKey(language, text))))];
  if (!missing.length) return;

  for (let index = 0; index < missing.length; index += 80) {
    const chunk = missing.slice(index, index + 80);
    const translations = await translateBatch(chunk, language);
    chunk.forEach((text, itemIndex) => {
      window.localStorage.setItem(cacheKey(language, text), translations[itemIndex] || text);
    });
  }
}

async function applyPageTranslation(language: LanguageCode) {
  const htmlLang = languageOptions.find((item) => item.code === language)?.htmlLang || "ja";
  document.documentElement.lang = htmlLang;
  document.documentElement.dataset.language = language;

  const textNodes = collectTextNodes();
  const fields = [...document.querySelectorAll<TranslatableField>("input[placeholder], textarea[placeholder]")].filter(
    (field) => !field.closest("[data-no-translate]")
  );
  const attributeElements = [...document.querySelectorAll<HTMLElement>(translatableAttributes.map((attribute) => `[${attribute}]`).join(","))].filter(
    (element) => !element.closest("[data-no-translate]")
  );

  const originals: string[] = [];

  textNodes.forEach((node) => {
    if (!originalText.has(node)) originalText.set(node, node.textContent || "");
    const original = originalText.get(node) || "";
    originals.push(original);
    if (language === "ja" && node.textContent !== original) node.textContent = original;
  });

  fields.forEach((field) => {
    if (!originalPlaceholder.has(field)) originalPlaceholder.set(field, field.placeholder);
    const original = originalPlaceholder.get(field) || "";
    originals.push(original);
    if (language === "ja") field.placeholder = original;
  });

  attributeElements.forEach((element) => {
    if (!originalAttributes.has(element)) originalAttributes.set(element, new Map());
    const originalsByAttribute = originalAttributes.get(element)!;

    translatableAttributes.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      if (!originalsByAttribute.has(attribute)) originalsByAttribute.set(attribute, value);
      const original = originalsByAttribute.get(attribute) || "";
      originals.push(original);
      if (language === "ja") element.setAttribute(attribute, original);
    });
  });

  if (language === "ja") return;
  await ensureTranslations(originals, language);

  textNodes.forEach((node) => {
    const original = originalText.get(node) || "";
    const translated = window.localStorage.getItem(cacheKey(language, original));
    if (translated && node.textContent !== translated) node.textContent = translated;
  });

  fields.forEach((field) => {
    const original = originalPlaceholder.get(field) || "";
    const translated = window.localStorage.getItem(cacheKey(language, original));
    if (translated) field.placeholder = translated;
  });

  attributeElements.forEach((element) => {
    const originalsByAttribute = originalAttributes.get(element);
    if (!originalsByAttribute) return;

    translatableAttributes.forEach((attribute) => {
      const original = originalsByAttribute.get(attribute);
      if (!original) return;
      const translated = window.localStorage.getItem(cacheKey(language, original));
      if (translated) element.setAttribute(attribute, translated);
    });
  });
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage);
  const applyingRef = useRef(false);

  useEffect(() => {
    let frame = 0;

    const schedule = () => {
      if (applyingRef.current || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyingRef.current = true;
        void applyPageTranslation(language).finally(() => {
          applyingRef.current = false;
        });
      });
    };

    window.localStorage.setItem("site-language", language);
    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: LanguageCode) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem("site-language", nextLanguage);
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const activeLanguage = languageOptions.find((item) => item.code === language) || languageOptions[0];

  return (
    <div className="relative z-[100] w-28 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur" aria-label="Language" data-no-translate>
      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/15 backdrop-blur">
          <div className="max-h-52 overflow-y-auto pr-0.5">
            {languageOptions.map((item) => {
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
        aria-label="Language"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="flex items-center gap-2">
          <Languages size={16} aria-hidden="true" />
          {activeLanguage.shortLabel}
        </span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
    </div>
  );
}
