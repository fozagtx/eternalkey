'use client';

import React, { FC } from 'react';
import Particles from "@/components/ui/particles";
import FeatureSection from "@/components/blocks/FeatureSection";
import { Hero } from '@/components/home/Hero';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FAQ } from '@/components/home/FAQ';
import { useBitcoinWallet } from '@/components/BitcoinWalletProvider';
import { useRouter } from 'next/navigation';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "EternalKey",
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
      <div className="min-h-screen bg-gradient-to-b from-[#0B0B10] via-[#0d0d18] to-black text-white overflow-hidden relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-[#8B7CFF]/20 blur-3xl" />
          <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-[#FF4D6D]/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#E6E1FF]/12 blur-3xl" />
        </div>
        <div className="relative min-h-screen flex flex-col">
          <Particles
            className="absolute inset-0 pointer-events-none"
            quantity={300}
            staticity={30}
            ease={50}
            color="#ffffff"
          />
          <div className="relative z-10 text-center space-y-16 p-8 max-w-6xl mx-auto">
            <Hero />
            <FeatureSection />
            <HowItWorks />
            <FAQ />
            
            {/* Trust Indicators */}
            <div className="pt-16 border-t border-zinc-900">
              <div className="flex flex-wrap justify-center text-zinc-500 text-sm">
                <a href="https://twitter.com/amritwt" className="hover:underline">@amritwt</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homepage;
