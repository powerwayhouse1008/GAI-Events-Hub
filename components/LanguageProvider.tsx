"use client";

import Script from "next/script";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { getLanguage, languages, type LanguageCode } from "@/lib/i18n";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement?: new (
          options: { pageLanguage: string; includedLanguages: string; autoDisplay: boolean },
          elementId: string
        ) => void;
      };
    };
  }
}

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function setGoogleTranslateCookie(language: LanguageCode) {
  const value = language === "ja" ? "" : `/ja/${language === "zh" ? "zh-CN" : language}`;
  const maxAge = language === "ja" ? "Max-Age=0" : "Max-Age=31536000";

  document.cookie = `googtrans=${value}; path=/; ${maxAge}; SameSite=Lax`;
  document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}; ${maxAge}; SameSite=Lax`;
}

function getStoredLanguage() {
  if (typeof window === "undefined") return "ja";
  return getLanguage(window.localStorage.getItem("site-language"));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage);

  useEffect(() => {
    const htmlLang = languages.find((item) => item.code === language)?.htmlLang || "ja";
    document.documentElement.lang = htmlLang;
    document.documentElement.dataset.language = language;
    window.localStorage.setItem("site-language", language);
  }, [language]);

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      const TranslateElement = window.google?.translate?.TranslateElement;
      if (!TranslateElement) return;

      new TranslateElement(
        {
          pageLanguage: "ja",
          includedLanguages: languages.map((item) => (item.code === "zh" ? "zh-CN" : item.code)).join(","),
          autoDisplay: false
        },
        "google_translate_element"
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: LanguageCode) => {
        setLanguageState(nextLanguage);
        setGoogleTranslateCookie(nextLanguage);
        window.localStorage.setItem("site-language", nextLanguage);
        window.location.reload();
      }
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
      <div id="google_translate_element" className="hidden" />
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
      className="fixed right-4 top-4 z-[100] w-32 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-xl shadow-slate-900/15 backdrop-blur"
      aria-label="Language"
    >
      {open && (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl shadow-slate-900/15 backdrop-blur">
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
        aria-label="Language"
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
