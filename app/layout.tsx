import type { Metadata } from "next";
import { GlobalButtonLoading } from "@/components/GlobalButtonLoading";
import { LanguageProvider } from "@/components/LanguageProvider";
import { SiteFooterLinks } from "@/components/SiteFooterLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global AI Industry Alliance",
  description: "AI event, community and organizer platform."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <LanguageProvider>
          <GlobalButtonLoading />
          {children}
          <SiteFooterLinks />
        </LanguageProvider>
      </body>
    </html>
  );
}
