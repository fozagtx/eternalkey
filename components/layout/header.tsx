"use client"

import React from 'react'
import { Vault, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider'
import { WalletModal } from '@/components/ui/walletModal'

export function Header() {
  const { wallet, connectWallet, isLoading } = useBitcoinWallet()
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  const handleWalletSelect = async (walletId: 'unisat' | 'leather' | 'xverse' | 'okx') => {
    await connectWallet(walletId)
  }

  const handleButtonClick = () => {
    if (!wallet.isConnected) {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Heritaz Branding */}
            <div className="flex items-center gap-3">
              <Vault className="w-8 h-8 text-[#F7931A]" />
              <h1 className="text-2xl md:text-3xl font-bold text-[#F7931A]">
                Heritaz
              </h1>
            </div>

            {/* Right - Wallet Connection */}
            <Button
              onClick={handleButtonClick}
              disabled={wallet.isConnected || isLoading}
              className="group bg-gradient-to-r from-[#F7931A] to-orange-600 hover:from-orange-600 hover:to-[#F7931A] text-black font-semibold text-sm px-4 py-2 rounded-xl shadow-lg shadow-[#F7931A]/25 hover:shadow-xl hover:shadow-[#F7931A]/40 transition-all duration-300 hover:scale-105 disabled:opacity-50"
            >
              {wallet.isConnected
                ? `Connected${wallet.walletType ? ` (${wallet.walletType.charAt(0).toUpperCase() + wallet.walletType.slice(1)})` : ''}`
                : isLoading
                ? 'Connecting...'
                : 'Connect Wallet'}
              {!wallet.isConnected && <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Wallet Selection Modal */}
      <WalletModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onWalletSelect={handleWalletSelect}
      />
    </>
  )
}
