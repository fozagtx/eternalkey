'use client';

import React, { FC } from 'react';
import { Header } from '@/components/layout/header';
import { Hero } from '@/components/features/heroSection';
import { HowItWorks } from '@/components/features/howItWorks';
import { Features } from '@/components/features/features';
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider';
import { useRouter } from 'next/navigation';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Heritaz",
  "applicationCategory": "DeFi",
  "operatingSystem": "Web",
  "description": "A programmable Bitcoin inheritance vault using Charms Protocol, ensuring your digital assets reach your loved ones.",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Person",
    "name": "Charms Protocol Team",
    "url": "https://charms.dev"
  }
};

const Homepage: FC = () => {
  const { wallet } = useBitcoinWallet();
  const router = useRouter();

  // Auto-redirect to dashboard when wallet connects
  React.useEffect(() => {
    if (wallet.isConnected && wallet.address) {
      router.push('/app');
    }
  }, [wallet.isConnected, wallet.address, router]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Floating Header */}
        <Header />

        {/* Main Content */}
        <div className="pb-16">
          {/* Hero Section */}
          <Hero
            title="Secure Bitcoin Inheritance for Modern Families"
            subtitle="Modern, trust-driven inheritance rails on Bitcoin. Automate check-ins, lock assets with confidence, and keep beneficiaries informed powered by Charms Protocol."
            eyebrow="Next-Gen Bitcoin Inheritance"
            ctaLabel="Launch Heritaz"
          />

          {/* How It Works Section */}
          <HowItWorks />

          {/* Features Section */}
          <Features />

          {/* Footer */}
          <footer className="!bg-black mt-20 pt-16 border-t border-white/10" style={{backgroundColor: '#000000 !important'}}>
            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#F7931A] to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-sm">₿</span>
                  </div>
                  <span className="text-xl font-bold text-white">Heritaz</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Secure Bitcoin inheritance for the digital age
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <a href="https://twitter.com/zanbuilds" className="text-gray-400 hover:text-[#F7931A] transition-colors duration-300">
                    @zanbuilds
                  </a>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-xs text-gray-500">
                    © 2024 Heritaz.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Homepage;
