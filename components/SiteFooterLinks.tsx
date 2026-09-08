import { footerLinkItems, normalizeFooterUrl } from "@/lib/footer-links";
import { getFooterLinks } from "@/lib/footer-link-settings";

export async function SiteFooterLinks() {
  const links = await getFooterLinks();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 text-white">
      <nav className="mx-auto flex max-w-[1500px] flex-wrap gap-x-6 gap-y-4 text-sm font-bold text-slate-200 md:text-base" aria-label="Footer">
        {footerLinkItems.map((link) => (
          <a
            key={link.key}
            href={normalizeFooterUrl(links[link.key] || link.defaultUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
