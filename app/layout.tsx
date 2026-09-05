import type { Metadata, Viewport } from "next";
import { Pacifico, Fredoka, Nunito_Sans, Bangers, Permanent_Marker } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import OrderBar from "@/components/OrderBar";
import HideOnAdmin from "@/components/HideOnAdmin";
import { getSettings } from "@/lib/settings";

// reCAPTCHA v3 is behavioral — loading it site-wide lets Google build a risk
// profile across the whole visit. The token is executed + verified only on the
// sensitive action (order submit); see components/order/CheckoutForm.tsx.
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Bouncy soda-fountain script — the wordmark + hero flourishes. Accents only.
const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

// Chunky rounded display face — headings + menu-board labels. Friendly + poppy.
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

// Highly legible body sans — shared across the Mio/Fairview family of sites.
const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

// Loud comic-graffiti caps — Big Poppa's Kettle Corn display type. Scoped to
// the /big-poppas sub-brand only (hip-hop grunge, spray-can energy).
const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});

// Hand-tagged marker — Big Poppa's flavor puns + drip captions. Accents only.
const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marker",
});

export const metadata: Metadata = {
  title: "Soady Poppers Soda Pop Shop — Dirty Sodas, Lemonade & Kettle Corn | Fairview, MI",
  // Short brand name browsers use for home-screen shortcuts / new-tab tiles —
  // without these, Chrome/Safari fall back to the "| Fairview, MI" title suffix.
  applicationName: "Soady Poppers",
  appleWebApp: { title: "Soady Poppers" },
  description:
    "Soady Poppers is a family-run soda pop shop in Fairview, Michigan — hand-crafted dirty sodas, fresh-squeezed lemonade, energy refreshers and Big Poppa's gourmet kettle corn. Made fresh at the counter — come on in!",
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F0799F",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { hours } = await getSettings();
  return (
    <html
      lang="en"
      className={`${pacifico.variable} ${fredoka.variable} ${nunito.variable} ${bangers.variable} ${permanentMarker.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Storefront chrome — hidden on the internal /admin console. */}
        <HideOnAdmin>
          <Navigation hours={hours} />
        </HideOnAdmin>
        <main className="flex-1">{children}</main>
        <HideOnAdmin>
          <Footer hours={hours} />
        </HideOnAdmin>
        {/* Mobile-only floating "Order Online" bar (hidden on the order flow) */}
        <HideOnAdmin>
          <OrderBar />
        </HideOnAdmin>
        {RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
