import type { Metadata, Viewport } from "next";
import { Kalam, Mukta } from "next/font/google";
import "./globals.css";

const mukta = Mukta({ subsets: ["devanagari", "latin"], weight: ["500", "700"], variable: "--font-mukta" });
const kalam = Kalam({ subsets: ["devanagari", "latin"], weight: ["400", "700"], variable: "--font-kalam" });

export const metadata: Metadata = {
  title: "Hisabb - Voice Credit Ledger",
  description: "Local-first, voice-driven credit ledger for retail shops",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hisabb",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mukta.variable} ${kalam.variable} bg-[#FAF8F3]`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#FAF8F3] text-[#1C1917] antialiased select-none font-sans"
      >
        {children}
      </body>
    </html>
  );
}
