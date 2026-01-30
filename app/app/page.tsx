'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { BitcoinInheritanceVault } from '@/components/bitcoinInheritanceVault';

const AppPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white relative overflow-hidden">
      {/* Header */}
      <Header />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-[#F7931A]/10 blur-3xl" />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-[#F7931A]/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-[#F7931A]/5 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-14 space-y-10">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#F7931A]">
              <span className="h-[1px] w-8 bg-[#F7931A]/60" />
              Vault Console
            </p>
            <h1 className="text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Heritaz · Bitcoin Inheritance
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Operate your programmable Bitcoin inheritance vault with live check-ins,
              beneficiary controls, and trustless transfers powered by Charms Protocol.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#F7931A]/15 border border-[#F7931A]/30 text-[#F7931A]">Premium security</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">Automated check-ins</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">Data-informed controls</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 shadow-2xl backdrop-blur max-w-sm w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F7931A] to-orange-500 shadow-lg shadow-[#F7931A]/40" />
              <div>
                <p className="text-sm text-white font-semibold">Live vault console</p>
                <p className="text-xs text-gray-300">Secure • Trust-driven • Growth-ready</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              Connect your wallet to continue. We never hold keys—everything is enforced on-chain.
            </p>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-lg">
          <BitcoinInheritanceVault />
        </div>
      </div>
    </div>
  );
};

export default AppPage;
