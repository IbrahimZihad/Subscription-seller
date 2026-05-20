import type { Metadata } from "next";
import "./global.css";

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
    "buy Netflix Bangladesh",
    "cheap Netflix BD",
    "Spotify Bangladesh",
    "YouTube Premium Bangladesh",
    "Adobe subscription Bangladesh",
    "Microsoft 365 Bangladesh",
    "Canva Pro Bangladesh",
    "NordVPN Bangladesh",
    "digital services Bangladesh",
    "online subscription service BD",
    "premium subscription BD",
    "সাবস্ক্রিপশন বাংলাদেশ",
    "নেটফ্লিক্স বাংলাদেশ",
  ],

  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],

  creator: siteConfig.name,
  publisher: siteConfig.name,

  // FIXED
  metadataBase: new URL(
    siteConfig.url || "http://localhost:3000"
  ),

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Digital Subscriptions in Bangladesh`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.png"],
    creator: "@yourTwitterHandle",
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,

    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
      },
    ],

    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },

  category: "e-commerce",

  classification: "Digital Subscription Services",

  referrer: "origin-when-cross-origin",

  applicationName: siteConfig.name,

  generator: "Next.js",

  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN",
  },

  other: {
    "geo.region": "BD",
    "geo.country": "Bangladesh",
    "geo.placename": "Dhaka",
    "og:country-name": "Bangladesh",
    "og:locale:alternate": "bn_BD",
  },
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