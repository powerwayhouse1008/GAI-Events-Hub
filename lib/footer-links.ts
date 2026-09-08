export const footerLinkStorageKey = "gai-footer-links";

export const footerLinkItems = [
  {
    key: "company",
    label: "会社情報",
    defaultUrl: "https://www.accenture.com/jp-ja/about/company-index"
  },
  {
    key: "news",
    label: "お知らせ",
    defaultUrl: "https://www.accenture.com/jp-ja/about/newsroom"
  },
  {
    key: "contact",
    label: "お問い合わせ",
    defaultUrl: "https://www.accenture.com/jp-ja/about/contact-us"
  }
] as const;

export type FooterLinkKey = (typeof footerLinkItems)[number]["key"];
export type FooterLinkMap = Record<string, string>;

export function normalizeFooterUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function getDefaultFooterLinks(): FooterLinkMap {
  return Object.fromEntries(footerLinkItems.map((item) => [item.key, item.defaultUrl]));
}

export function readStoredFooterLinks() {
  if (typeof window === "undefined") return getDefaultFooterLinks();

  const saved = window.localStorage.getItem(footerLinkStorageKey);
  if (!saved) return getDefaultFooterLinks();

  try {
    return { ...getDefaultFooterLinks(), ...(JSON.parse(saved) as FooterLinkMap) };
  } catch {
    return getDefaultFooterLinks();
  }
}
