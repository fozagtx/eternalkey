'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';

interface BitcoinWalletContextType {
  wallet: {
    isConnected: boolean;
    address: string;
    network: 'mainnet' | 'testnet';
    balance?: number;
  };
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  detectedWallet: 'unisat' | 'xverse' | 'okx' | null;
}

const BitcoinWalletContext = createContext<BitcoinWalletContextType | null>(null);

export const useBitcoinWallet = () => {
  const context = useContext(BitcoinWalletContext);
  if (!context) {
    throw new Error('useBitcoinWallet must be used within BitcoinWalletProvider');
  }
  return context;
};

interface BitcoinWalletProviderProps {
  children: ReactNode;
}

declare global {
  interface UnisatApi {
    requestAccounts: () => Promise<string[]>;
    switchNetwork: (network: string) => Promise<void>;
    getNetwork: () => Promise<string>;
    getBalance: () => Promise<{ total: number }>;
    getAccounts: () => Promise<string[]>;
  }
  interface Window {
    unisat?: UnisatApi;
    xverse?: Record<string, unknown>;
    okxwallet?: { bitcoin?: unknown };
  }
}

export const BitcoinWalletProvider: React.FC<BitcoinWalletProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedWallet, setDetectedWallet] = useState<'unisat' | 'xverse' | 'okx' | null>(null);
  const [wallet, setWallet] = useState<BitcoinWalletContextType['wallet']>({
    isConnected: false,
    address: '',
    network: 'testnet',
    balance: 0
  });

  const detectWallet = useCallback(() => {
    if (typeof window === 'undefined') return null; // SSR check
    if (window.unisat) return 'unisat';
    if (window.xverse) return 'xverse';
    if (window.okxwallet?.bitcoin) return 'okx';
    return null;
  }, []);

  const connectUnisat = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!window.unisat) {
        toast.error('Unisat wallet not installed. Please install from unisat.io');
        window.open('https://unisat.io', '_blank');
        return;
      }

      // Request access to the wallet
      const accounts = await window.unisat.requestAccounts();

      if (accounts.length === 0) {
        toast.error('No accounts found in Unisat wallet');
        return;
      }

      const address = accounts[0];

      // Switch to testnet
      try {
        await window.unisat.switchNetwork('testnet');
      } catch (networkError) {
        console.warn('Failed to switch to testnet:', networkError);
      }

      // Get network
      const network = await window.unisat.getNetwork();

      // Get balance
      const balance = await window.unisat.getBalance();

      setWallet((prev) => ({
        ...prev,
        isConnected: true,
        address: address,
        network: network === 'testnet' ? 'testnet' : 'mainnet',
        balance: balance.total
      }));

      toast.success(`Connected to Unisat wallet: ${address.slice(0, 6)}...${address.slice(-4)}`);

    } catch (error: unknown) {
      console.error('Unisat connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Unisat wallet';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectXverse = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!window.xverse) {
        toast.error('Xverse wallet not installed. Please install from xverse.app');
        window.open('https://www.xverse.app/', '_blank');
        return;
      }

      // Note: Xverse has a different API structure
      toast.info('Xverse integration coming soon. Use Unisat for now.');

    } catch (error: unknown) {
      console.error('Xverse connection error:', error);
      toast.error('Failed to connect to Xverse wallet');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const availableWallet = detectWallet();

    if (!availableWallet) {
      toast.error('No supported Bitcoin wallet detected.');
      return;
    }

    setDetectedWallet(availableWallet);

    if (availableWallet === 'unisat') {
      await connectUnisat();
      return;
    }

    if (availableWallet === 'xverse') {
      await connectXverse();
      return;
    }

    toast.info('OKX wallet integration coming soon.');
  }, [connectUnisat, connectXverse, detectWallet]);

  const disconnectWallet = useCallback(() => {
    setWallet((prev) => ({
      ...prev,
      isConnected: false,
      address: '',
      balance: 0
    }));
    toast.success('Wallet disconnected');
  }, []);

  useEffect(() => {
    // Detect wallet once on mount
    setDetectedWallet(detectWallet());

    // Check if wallet is already connected
    const checkConnection = async () => {
      if (typeof window === 'undefined') return; // SSR check

      if (window.unisat) {
        try {
          const accounts = await window.unisat.getAccounts();
          if (accounts.length > 0) {
            await connectUnisat();
          }
        } catch (connectionError) {
          console.log('Wallet not connected', connectionError);
        }
      }
    };

    checkConnection();
  }, [connectUnisat, detectWallet]);

  return (
    <BitcoinWalletContext.Provider value={{ wallet, isLoading, connectWallet, disconnectWallet, detectedWallet }}>
      {children}
    </BitcoinWalletContext.Provider>
  );
};
