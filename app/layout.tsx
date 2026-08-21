import type { Metadata, Viewport } from "next";
import { Pacifico, Fredoka, Nunito_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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

export const metadata: Metadata = {
  title: "Soady Poppers Soda Pop Shop — Dirty Sodas, Lemonade & Kettle Corn | Fairview, MI",
  description:
    "Soady Poppers is a family-run soda pop shop in Fairview, Michigan — hand-crafted dirty sodas, fresh-squeezed lemonade, energy refreshers and Big Poppa's gourmet kettle corn. Made fresh at the counter — come on in!",
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F0799F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${pacifico.variable} ${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
