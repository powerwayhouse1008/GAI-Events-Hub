"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { getLanguage, languages, translatePhrase, type LanguageCode } from "@/lib/i18n";

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getStoredLanguage() {
  if (typeof window === "undefined") return "ja";
  return getLanguage(window.localStorage.getItem("site-language"));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getStoredLanguage);

  useEffect(() => {
    const htmlLang = languages.find((item) => item.code === language)?.htmlLang || "ja";
    window.localStorage.setItem("site-language", language);
    document.documentElement.lang = htmlLang;
    document.documentElement.dataset.language = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: LanguageCode) => {
        setLanguageState(nextLanguage);
        window.localStorage.setItem("site-language", nextLanguage);
      },
      t: (text: string) => translatePhrase(text, language)
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
  const activeLanguage = languages.find((item) => item.code === language) || languages[0];

  return (
    <div className="relative z-[100] w-28 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur" aria-label={translatePhrase("Language", language)} data-no-translate>
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
        aria-label={translatePhrase("Language", language)}
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
