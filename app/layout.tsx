import type { Metadata } from "next";
import { GlobalButtonLoading } from "@/components/GlobalButtonLoading";
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
        <GlobalButtonLoading />
        {children}
      </body>
    </html>
  );
}
