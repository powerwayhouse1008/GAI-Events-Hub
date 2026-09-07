import Link from "next/link";

const footerLinks = [
  { href: "/company", label: "会社情報" },
  { href: "/news", label: "お知らせ" },
  { href: "/contact", label: "お問い合わせ" }
];

export function SiteFooterLinks() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 text-white">
      <nav className="mx-auto flex max-w-[1500px] flex-wrap gap-x-6 gap-y-4 text-sm font-bold text-slate-200 md:text-base" aria-label="Footer">
        {footerLinks.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-md hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
