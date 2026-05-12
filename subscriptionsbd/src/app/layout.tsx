import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/hooks/useCart";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/ui/WhatsAppWidget";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "subscription Bangladesh",
    "Netflix Bangladesh",
    "ChatGPT Bangladesh",
    "digital subscription BD",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <WhatsAppWidget phone={siteConfig.whatsapp} />
        </CartProvider>
      </body>
    </html>
  );
}