import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ManywiseProvider } from "@/components/providers/manywise-provider";
import "./globals.css";

const bodyFont = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const displayFont = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Manywise // Room Zero", template: "%s // Manywise" },
  description: "The private-feeling forum behind the obvious conversation: INFJ signal, anime analysis, live channels, strange ideas, and people who catch the subtext.",
  applicationName: "Manywise",
  category: "community",
  keywords: ["INFJ community", "thoughtful conversation", "personality reflection", "creative community", "online forum"],
  authors: [{ name: "Manywise" }],
  creator: "Manywise",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Manywise // Room Zero",
    description: "The hidden-frequency forum for INFJ reflection, anime analysis, live channels, and the layer underneath.",
    type: "website",
    siteName: "Manywise",
    url: "/",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Manywise Room Zero — the forum behind the obvious conversation" }],
  },
  twitter: { card: "summary_large_image", title: "Manywise // Room Zero", description: "If you caught the signal, you’re already close.", images: ["/opengraph-image"] },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = { colorScheme: "dark light", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#07100e" }, { media: "(prefers-color-scheme: dark)", color: "#030907" }] };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body><a className="skip-link" href="#main-content">Skip to main content</a><ManywiseProvider>{children}</ManywiseProvider></body>
    </html>
  );
}
