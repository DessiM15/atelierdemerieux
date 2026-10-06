import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Playfair_Display } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/components/cart-provider";
import { CartDrawer } from "@/components/cart-drawer";
import { LiveAnnouncer } from "@/components/live-announcer";
import { RevealController } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/* ---------------------------------------------------------------------------
   Type
   Both serifs are read straight off Sydney's board. Jost is the one addition:
   neither Playfair nor Cormorant survives at 13px in a checkout field, and a
   price that can't be read is a conversion problem before it's a taste one.
   All three are self-hosted by next/font — no third-party request, no layout
   shift, no FOUT.
   --------------------------------------------------------------------------- */

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
  display: "swap",
});

/* ------------------------------------------------------------------------- */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://atelierdemerieux.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atelier de Merieux — Handmade crochet blankets and small goods",
    template: "%s · Atelier de Merieux",
  },
  description:
    "Handcrafted crochet blankets, throws and small goods, worked one at a time in plum, taupe and cream. Made to order and ready to ship.",
  keywords: [
    "handmade crochet blanket",
    "crochet throw",
    "handmade home goods",
    "custom crochet commission",
  ],
  openGraph: {
    type: "website",
    siteName: "Atelier de Merieux",
    title: "Atelier de Merieux — Handmade crochet blankets and small goods",
    description:
      "Handcrafted crochet blankets, throws and small goods, worked one at a time in plum, taupe and cream.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier de Merieux",
    description: "Handcrafted crochet blankets and small goods, worked one at a time.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f7f2e9",
  // Zoom is never disabled. Capping it, or setting user-scalable=no, is a
  // direct WCAG 1.4.4 failure and one of the most common ones on the web.
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable} ${jost.variable}`}>
      <body>
        <CartProvider>
          {/* First focusable element on every page. */}
          <a href="#main" className="sr-only-focusable">
            Skip to content
          </a>

          <SiteHeader />

          <main id="main" tabIndex={-1}>
            {children}
          </main>

          <SiteFooter />

          <CartDrawer />
          <LiveAnnouncer />
          <RevealController />
        </CartProvider>
      </body>
    </html>
  );
}
