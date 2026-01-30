import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { BitcoinWalletProvider } from '@/components/providers/bitcoinWalletProvider';
import { ErrorBoundary } from '@/components/common/errorBoundary';

export const metadata: Metadata = {
  metadataBase: new URL("https://heritaz.xyz"),
  title: "Heritaz - Secure Bitcoin Inheritance for Modern Families",
  description: "Modern, trust-driven inheritance rails on Bitcoin. Automate check-ins, lock assets with confidence, and keep beneficiaries informed—powered by Charms Protocol.",
  keywords: ["Bitcoin inheritance", "Heritaz", "Charms Protocol", "digital legacy", "Bitcoin vault", "crypto inheritance", "Bitcoin security"],
  openGraph: {
    title: "Heritaz - Secure Bitcoin Inheritance for Modern Families",
    description: "Modern, trust-driven inheritance rails on Bitcoin. Automate check-ins, lock assets with confidence, and keep beneficiaries informed—powered by Charms Protocol.",
    url: "https://heritaz.xyz",
    siteName: "Heritaz",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heritaz - Secure Bitcoin Inheritance for Modern Families",
    description: "Modern, trust-driven inheritance rails on Bitcoin. Automate check-ins, lock assets with confidence, and keep beneficiaries informed—powered by Charms Protocol.",
    creator: "@zanbuilds",
  },
  icons: {
    icon: [
      { url: 'favicon.svg', type: 'image/svg+xml' },
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
        <ErrorBoundary>
          <BitcoinWalletProvider>
            <Analytics />
            <Toaster />
            {children}
          </BitcoinWalletProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
