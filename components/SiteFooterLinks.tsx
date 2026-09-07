import Link from "next/link";
import { footerLinkItems } from "@/lib/footer-links";

export function SiteFooterLinks() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 text-white">
      <nav className="mx-auto flex max-w-[1500px] flex-wrap gap-x-6 gap-y-4 text-sm font-bold text-slate-200 md:text-base" aria-label="Footer">
        {footerLinkItems.map((link) => (
          <Link key={link.key} href={`/footer/${link.key}`} className="rounded-md hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300">
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
