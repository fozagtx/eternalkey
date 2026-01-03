import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { BitcoinWalletProvider } from '@/components/BitcoinWalletProvider';

export const metadata: Metadata = {
  metadataBase: new URL("https://eternalkey.xyz"),
  title: "Eternal Key - Programmable Bitcoin Inheritance with Charms Protocol",
  description: "A programmable inheritance vault on Bitcoin using Charms Protocol. Secure your digital assets' future with automated, trustless transfers to designated beneficiaries.",
  keywords: ["Bitcoin inheritance", "Charms Protocol", "dead man's switch", "digital assets", "Bitcoin vault", "crypto inheritance", "programmable Bitcoin"],
  openGraph: {
    title: "Eternal Key - Programmable Bitcoin Inheritance with Charms Protocol",
    description: "Secure your Bitcoin assets' future with programmable inheritance using Charms Protocol. Set up automated transfers for your digital assets.",
    url: "https://eternalkey.xyz",
    siteName: "Eternal Key",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eternal Key - Programmable Bitcoin Inheritance with Charms Protocol",
    description: "Secure your Bitcoin assets' future with programmable inheritance using Charms Protocol.",
    creator: "@amritwt",
  },
  icons: {
    icon: [
      { url: 'favicon.ico', sizes: 'any' },
      { url: 'android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: 'android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: 'apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "6JtALOS_ykm2LnlrEBOUUjVoc7NCwn",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <BitcoinWalletProvider>
          <Analytics />
          <Toaster />
          {children}
        </BitcoinWalletProvider>
      </body>
    </html>
  );
}
