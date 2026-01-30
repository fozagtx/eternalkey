'use client';

import React, { FC, useState, useEffect, useCallback } from 'react';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DatePickerDemo } from '@/components/customDatePicker';
import { differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  CharmsVaultManager,
  InheritanceVault,
  VaultStatus,
  Beneficiary
} from '@/lib/charms-vault';
import { useBitcoinWallet } from '@/components/providers/bitcoinWalletProvider';

interface ExtendDuration {
  days: number;
  months: number;
  years: number;
}

export const BitcoinInheritanceVault: FC = () => {
  // Bitcoin wallet integration
  const { wallet, connectWallet, isLoading, detectedWallet } = useBitcoinWallet();
  const walletIsConnected = Boolean(wallet?.isConnected);
  const walletAddress = wallet?.address ?? '';

  // Real Charms Protocol integration
  const [charmsManager] = useState(() => new CharmsVaultManager());
  const [vaults, setVaults] = useState<InheritanceVault[]>([]);

  // Vault creation state
  const [beneficiaryAddress, setBeneficiaryAddress] = useState<string>('');
  const [beneficiaryPercentage, setBeneficiaryPercentage] = useState<number>(100);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [depositAmount, setDepositAmount] = useState<number>(0.001); // Bitcoin amount

  // Check-in state
  const [extendDuration, setExtendDuration] = useState<ExtendDuration>({
    days: 0,
    months: 0,
    years: 0
  });

  const fetchVaults = useCallback(async () => {
    if (!walletAddress) return;
    try {
      // Query actual deployed contract on Bitcoin testnet
      const deployedContract = process.env.NEXT_PUBLIC_DEPLOYED_CONTRACT_ADDRESS || 'tb1qb55df1e19a57fa98938f2e776abd07ed';

      // First try to get vaults for this specific wallet address
      const walletVaults = await charmsManager.getVaultsByOwner(walletAddress);

      if (walletVaults && walletVaults.length > 0) {
        setVaults(walletVaults);
      } else {
        // No vaults found for this address yet
        setVaults([]);
        console.log(`No vaults found for wallet ${walletAddress} on deployed contract ${deployedContract}`);
      }
    } catch (error) {
      console.error('Error fetching vaults from deployed contract:', error);
      setVaults([]);
    }
  }, [walletAddress, charmsManager]);

  useEffect(() => {
    const initCharms = async () => {
      try {
        await charmsManager.init();
        toast.success('Charms Protocol initialized successfully!');
      } catch (error) {
        console.error('Failed to initialize Charms:', error);
        toast.error('Failed to initialize Charms Protocol');
      }
    };

    initCharms();
  }, [charmsManager]);

  useEffect(() => {
    if (walletIsConnected && walletAddress) {
      fetchVaults();
    }
  }, [walletIsConnected, walletAddress, fetchVaults]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  const addBeneficiary = () => {
    if (!beneficiaryAddress || beneficiaryPercentage <= 0) {
      toast.error('Please enter valid beneficiary address and percentage.');
      return;
    }

    if (beneficiaries.some(b => b.address === beneficiaryAddress)) {
      toast.error('Beneficiary address already added.');
      return;
    }

    const currentTotal = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (currentTotal + beneficiaryPercentage > 100) {
      toast.error('Total percentage cannot exceed 100%.');
      return;
    }

    const newBeneficiary: Beneficiary = {
      address: beneficiaryAddress,
      percentage: beneficiaryPercentage,
      name: `Beneficiary ${beneficiaries.length + 1}`,
    };

    setBeneficiaries([...beneficiaries, newBeneficiary]);
    setBeneficiaryAddress('');
    setBeneficiaryPercentage(100 - currentTotal - beneficiaryPercentage);
  };

  const removeBeneficiary = (address: string) => {
    setBeneficiaries(beneficiaries.filter(b => b.address !== address));
  };

  const createVault = async () => {
    if (!walletIsConnected || !walletAddress) {
      toast.error('Please connect your Bitcoin wallet.');
      return;
    }

    if (beneficiaries.length === 0) {
      toast.error('Please add at least one beneficiary.');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a deadline date.');
      return;
    }

    const totalPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
    if (totalPercentage !== 100) {
      toast.error('Beneficiary percentages must total exactly 100%.');
      return;
    }

    const durationMinutes = differenceInMinutes(selectedDate, new Date());
    if (durationMinutes <= 0) {
      toast.error('Selected date must be in the future.');
      return;
    }

    // Convert duration to Bitcoin blocks (approximately 10 minutes per block)
    const durationDays = durationMinutes / (60 * 24);
    const timeoutBlocks = Math.ceil(durationDays * 144); // ~144 blocks per day

    const result = await charmsManager.createVault({
      ownerAddress: walletAddress,
      beneficiaries,
      timeoutBlocks,
    });

    if (result.success) {
      toast.success('Bitcoin inheritance vault created successfully!');
      setBeneficiaries([]);
      setSelectedDate(undefined);
      setDepositAmount(0.001);
      fetchVaults();
    } else {
      toast.error(result.error || 'Failed to create vault');
    }
  };

  const handleCheckIn = async (vaultId: string) => {
    const result = await charmsManager.checkinVault(vaultId, walletAddress);

    if (result.success) {
      toast.success('Successfully checked in! Vault updated.');
      setExtendDuration({ days: 0, months: 0, years: 0 });
      fetchVaults();
    } else {
      toast.error(result.error || 'Check-in failed');
    }
  };

  const claimInheritance = async (vaultId: string, beneficiaryAddress: string) => {
    const result = await charmsManager.claimVault(vaultId, beneficiaryAddress);

    if (result.success && result.claimedAmount) {
      const btcAmount = (result.claimedAmount / 100000000).toFixed(8); // Convert satoshis to BTC
      toast.success(`Successfully claimed ${btcAmount} BTC!`);
      fetchVaults();
    } else {
      toast.error(result.error || 'Claim failed');
    }
  };

  const cancelVault = async (vaultId: string) => {
    // In a real implementation, we'd add a cancel vault function to CharmsVaultManager
    toast.info(`Vault cancellation functionality coming soon for ${vaultId}!`);
  };

  // Helper functions
  const satoshisToBTC = (satoshis: number): number => satoshis / 100000000;
  const blocksToDays = (blocks: number): number => blocks / 144; // ~144 blocks per day
  const formatTimeRemaining = (vault: InheritanceVault): string => {
    const currentBlock = 850000; // Mock current block height
    const blocksRemaining = (vault.last_checkin + vault.timeout_blocks) - currentBlock;
    if (blocksRemaining <= 0) return 'Expired';
    const daysRemaining = Math.ceil(blocksRemaining / 144);
    return `${daysRemaining} days`;
  };
  const isVaultExpired = (vault: InheritanceVault): boolean => {
    const currentBlock = 850000; // Mock current block height
    return currentBlock >= (vault.last_checkin + vault.timeout_blocks);
  };

  const StatusBadge: FC<{ vault: InheritanceVault }> = ({ vault }) => {
    const expired = isVaultExpired(vault);

    return (
      <span className={`px-2 py-1 rounded text-sm ${
        expired || vault.status === VaultStatus.Claimed
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          : vault.status === VaultStatus.Active
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      }`}>
        {expired ? 'Expired' : vault.status}
      </span>
    );
  };

  const DurationInputs: FC<{
    duration: ExtendDuration;
    onChange: (duration: ExtendDuration) => void;
  }> = ({ duration, onChange }) => {
    const handleChange = (field: keyof ExtendDuration, value: string) => {
      const numValue = parseInt(value) || 0;
      onChange({ ...duration, [field]: numValue });
    };

    return (
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Days
          </label>
          <input
            type="number"
            min="0"
            value={duration.days || ''}
            onChange={(e) => handleChange('days', e.target.value)}
            className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Months
          </label>
          <input
            type="number"
            min="0"
            value={duration.months || ''}
            onChange={(e) => handleChange('months', e.target.value)}
            className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Years
          </label>
          <input
            type="number"
            min="0"
            value={duration.years || ''}
            onChange={(e) => handleChange('years', e.target.value)}
            className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>
    );
  };

  if (!walletIsConnected) {
    return (
      <div className="p-8 max-w-6xl mx-auto min-h-[70vh] flex items-center justify-center">
        <div className="w-full bg-gradient-to-br from-[#0B0B10] via-[#0f1120] to-black border border-[#1f2338] rounded-3xl p-12 shadow-2xl shadow-[#8B7CFF]/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E6E1FF]">
                <span className="h-[1px] w-6 bg-[#8B7CFF]/60" />
                Connect to unlock vaults
              </p>
              <h2 className="text-3xl lg:text-4xl font-semibold text-white">
                Bitcoin Inheritance Vault
              </h2>
              <p className="text-lg text-[#C7C7D1] leading-relaxed">
                Link your Bitcoin wallet to orchestrate programmable inheritance: beneficiary splits,
                automated check-ins, and on-chain enforcement via Charms Protocol.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[#E6E1FF]">
                <div className="px-3 py-1 rounded-full bg-[#8B7CFF]/15 border border-[#8B7CFF]/30">
                  Testnet ready
                </div>
                <div className="px-3 py-1 rounded-full bg-[#FF4D6D]/12 border border-[#FF4D6D]/30 text-[#FFC9D6]">
                  Trust-driven automation
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
                  Wallet: {detectedWallet ? detectedWallet.toUpperCase() : 'scanning'}
                </div>
              </div>
            </div>

            <div className="w-full lg:w-96 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-lg shadow-black/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[#C7C7D1]">Connection status</span>
                <span className="inline-flex items-center gap-2 text-xs text-[#E6E1FF]">
                  <span className="h-2 w-2 rounded-full bg-[#FF4D6D] animate-pulse" />
                  Not connected
                </span>
              </div>
              <Button
                onClick={handleConnectWallet}
                className="w-full bg-gradient-to-r from-[#8B7CFF] to-[#FF4D6D] hover:brightness-110 text-white py-3 rounded-xl font-semibold shadow-lg shadow-[#8B7CFF]/30"
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : detectedWallet ? 'Connect Bitcoin Wallet' : 'Detecting wallet'}
              </Button>
              <div className="text-xs text-[#C7C7D1] space-y-2 mt-4">
                <p className="font-medium text-white">What you need</p>
                <ul className="space-y-1">
                  <li>• Unisat (testnet) or supported wallet</li>
                  <li>• One minute to approve connection</li>
                  <li>• Optional: create a demo vault after connecting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="space-y-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Bitcoin Inheritance Vault</h2>
              <p className="text-gray-400">
                Create programmable inheritance vaults on Bitcoin using Charms Protocol
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 shadow-inner shadow-black/40">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-sm text-white font-semibold">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </div>
              <span className="text-xs text-[#C7C7D1]">Connected</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30">Auto check-ins</span>
            <span className="px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">Beneficiary splits</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">Deadline reminders</span>
          </div>
        </div>

        {/* Create Vault Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Create New Vault</h3>

          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Amount (BTC)
              </label>
              <input
                type="number"
                min="0.00001"
                step="0.001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                         text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50"
                placeholder="Enter Bitcoin amount"
              />
            </div>

            {/* Beneficiaries */}
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Beneficiaries
              </label>
              <div className="flex gap-3 mb-3">
                <input
                  type="text"
                  value={beneficiaryAddress}
                  onChange={(e) => setBeneficiaryAddress(e.target.value)}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Bitcoin address"
                />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={beneficiaryPercentage}
                  onChange={(e) => setBeneficiaryPercentage(Number(e.target.value))}
                  className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg
                           text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/50"
                  placeholder="%"
                />
                <Button
                  onClick={addBeneficiary}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Add
                </Button>
              </div>

              {beneficiaries.length > 0 && (
                <div className="space-y-2">
                  {beneficiaries.map((beneficiary, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                      <div className="text-sm">
                        <span className="text-white">{beneficiary.address}</span>
                        <span className="text-orange-400 ml-2">{beneficiary.percentage}%</span>
                      </div>
                      <Button
                        onClick={() => removeBeneficiary(beneficiary.address)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <div className="text-sm text-gray-400">
                    Total: {beneficiaries.reduce((sum, b) => sum + b.percentage, 0)}%
                  </div>
                </div>
              )}
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-200">
                Inheritance Deadline
              </label>
              <DatePickerDemo
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
              {selectedDate && (
                <p className="text-sm text-zinc-400 mt-2">
                  ~{Math.ceil((differenceInMinutes(selectedDate, new Date()) / (60 * 24)) * 144)} Bitcoin blocks
                </p>
              )}
            </div>

            <Button
              onClick={createVault}
              className="w-full bg-gradient-to-r from-[#8B7CFF] to-[#FF4D6D] hover:brightness-110 text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#8B7CFF]/30"
              disabled={!selectedDate || beneficiaries.length === 0 || depositAmount <= 0}
            >
              Create Bitcoin Vault
            </Button>
          </div>
        </div>

        {/* Vaults List */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 shadow-lg border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Your Vaults</h3>

          {vaults.length === 0 ? (
            <p className="text-gray-400">No vaults found</p>
          ) : (
            <div className="space-y-6">
              {vaults.map((vault) => {
                const isOwner = vault.owner === walletAddress;
                const isBeneficiary = vault.beneficiaries.some(b => b.address === walletAddress);
                const timeRemaining = formatTimeRemaining(vault);
                const expired = isVaultExpired(vault);

                return (
                  <div
                    key={vault.vault_id}
                    className="bg-white/5 backdrop-blur rounded-lg p-6 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-white">Vault {vault.vault_id}</h4>
                          <StatusBadge vault={vault} />
                          {isOwner && <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">Owner</span>}
                          {isBeneficiary && !isOwner && <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">Beneficiary</span>}
                        </div>

                        <div className="space-y-1 text-sm">
                          <p className="text-gray-300">
                            <span className="text-gray-400">Balance:</span> {satoshisToBTC(vault.vault_balance).toFixed(8)} BTC
                          </p>
                          <p className="text-gray-300">
                            <span className="text-gray-400">Timeout:</span> {blocksToDays(vault.timeout_blocks).toFixed(1)} days
                          </p>
                          <p className="text-white font-medium">
                            Time Remaining: {timeRemaining}
                          </p>

                          <div className="mt-3">
                            <p className="text-gray-400 text-xs mb-2">Beneficiaries:</p>
                            {vault.beneficiaries.map((beneficiary, i) => (
                              <p key={i} className="text-gray-300 text-xs">
                                {beneficiary.address} ({beneficiary.percentage}%)
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {isBeneficiary && !isOwner ? (
                          <Button
                            onClick={() => claimInheritance(vault.vault_id, walletAddress)}
                            disabled={!expired || vault.status !== VaultStatus.Active}
                            className={cn(
                              "w-32 bg-gradient-to-r",
                              expired && vault.status === VaultStatus.Active
                                ? "from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600"
                                : "from-gray-500 to-gray-600 cursor-not-allowed"
                            )}
                          >
                            {expired ? 'Claim' : 'Pending'}
                          </Button>
                        ) : isOwner && vault.status === VaultStatus.Active && (
                          <>
                            <DurationInputs
                              duration={extendDuration}
                              onChange={setExtendDuration}
                            />
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleCheckIn(vault.vault_id)}
                                className="bg-[#8B7CFF] hover:bg-[#7a6ce6] text-white"
                              >
                                Check In
                              </Button>

                              <Button
                                onClick={() => cancelVault(vault.vault_id)}
                                variant="destructive"
                                className="bg-[#FF4D6D] hover:bg-[#e64460]"
                              >
                                Cancel
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h4 className="text-lg font-medium text-white mb-4">Demo & Testing</h4>
          <div className="flex gap-4">
            <Button
              onClick={async () => {
                const result = await charmsManager.createVault({
                  ownerAddress: walletAddress,
                  beneficiaries: [{
                    address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
                    percentage: 100,
                    name: 'Test Beneficiary'
                  }],
                  timeoutBlocks: 20, // Very short for testing
                });
                if (result.success) {
                  toast.success('Demo vault created (20 blocks = ~3 hours)');
                  fetchVaults();
                }
              }}
              className="bg-[#8B7CFF] hover:bg-[#7a6ce6] text-white"
            >
              Create Test Vault (20 blocks)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinInheritanceVault;
