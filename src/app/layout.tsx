import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ManywiseProvider } from "@/components/providers/manywise-provider";
import "./globals.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Manywise — The after-class INFJ clubroom", template: "%s · Manywise" },
  description: "A high-craft after-class club for adults who use INFJ as a reflection lens and love anime character study, creative fandom, and meaningful conversation.",
  applicationName: "Manywise",
  category: "community",
  keywords: ["INFJ community", "thoughtful conversation", "personality reflection", "creative community", "online forum"],
  authors: [{ name: "Manywise" }],
  creator: "Manywise",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Manywise — Meet us after class",
    description: "The 1–2% clubroom for INFJ reflection, original anime-inspired character study, and meaningful conversation.",
    type: "website",
    siteName: "Manywise",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Manywise — many perspectives, held with care" }],
  },
  twitter: { card: "summary_large_image", title: "Manywise — Meet us after class", description: "The 1–2% clubroom. Rare does not mean ranked.", images: ["/opengraph-image"] },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = { colorScheme: "light dark", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f4efe5" }, { media: "(prefers-color-scheme: dark)", color: "#132a26" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body><a className="skip-link" href="#main-content">Skip to main content</a><ManywiseProvider>{children}</ManywiseProvider></body>
    </html>
  );
}
