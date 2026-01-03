'use client';

import React from 'react';
import { BitcoinInheritanceVault } from '@/components/BitcoinInheritanceVault';

const AppPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0B10] via-[#0d0d18] to-black text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-10 h-64 w-64 rounded-full bg-[#8B7CFF]/20 blur-3xl" />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-[#FF4D6D]/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-[#E6E1FF]/10 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-14 space-y-10">
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E6E1FF]">
              <span className="h-[1px] w-8 bg-[#8B7CFF]/60" />
              Vault Console
            </p>
            <h1 className="text-4xl lg:text-5xl font-semibold text-white leading-tight">
              Eternal Key · Bitcoin Inheritance
            </h1>
            <p className="text-lg text-[#C7C7D1] max-w-2xl">
              Operate your programmable Bitcoin inheritance vault with live check-ins,
              beneficiary controls, and trustless transfers powered by Charms Protocol.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="px-3 py-1 rounded-full bg-[#8B7CFF]/15 border border-[#8B7CFF]/30 text-[#E6E1FF]">Premium security</span>
              <span className="px-3 py-1 rounded-full bg-[#FF4D6D]/15 border border-[#FF4D6D]/30 text-[#FFC9D6]">Automated check-ins</span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">Data-informed controls</span>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-5 shadow-2xl backdrop-blur max-w-sm w-full">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8B7CFF] to-[#FF4D6D] shadow-lg shadow-[#8B7CFF]/40" />
              <div>
                <p className="text-sm text-white font-semibold">Live vault console</p>
                <p className="text-xs text-[#C7C7D1]">Secure • Trust-driven • Growth-ready</p>
              </div>
            </div>
            <p className="text-sm text-[#C7C7D1] mt-3 leading-relaxed">
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
