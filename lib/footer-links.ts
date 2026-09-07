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
