// Bitcoin Vault Integration Layer
// TypeScript interface for interacting with Bitcoin inheritance vaults

export interface Beneficiary {
  address: string;
  percentage: number;
  backupContact?: string;
}

export interface InheritanceVault {
  owner: string;
  beneficiaries: Beneficiary[];
  timeoutBlocks: number;
  lastCheckin: number;
  vaultBalance: number; // satoshis
  status: VaultStatus;
  vaultId: string;
  createdAt: number;
}

export enum VaultStatus {
  Active = 'Active',
  Expired = 'Expired',
  Cancelled = 'Cancelled',
  Claimed = 'Claimed',
}

export interface VaultOperation {
  type: 'create' | 'checkin' | 'deposit' | 'claim' | 'cancel' | 'manage_beneficiaries';
  vaultId?: string;
  data?: Record<string, unknown>;
}

export interface CreateVaultParams {
  beneficiaries: Beneficiary[];
  timeoutBlocks: number;
  initialDeposit: number; // satoshis
  vaultId: string;
}

export interface CheckInParams {
  vaultId: string;
  newTimeoutBlocks?: number;
}

export interface ClaimInheritanceParams {
  vaultId: string;
  beneficiaryAddress: string;
}

export class BitcoinVaultManager {
  private vaults: Map<string, InheritanceVault> = new Map();
  private mockCurrentBlock = 740000; // Mock Bitcoin block height for testing

  constructor() {
    // Initialize with some demo data for development
    this.initializeDemoVaults();
  }

  /**
   * Get current Bitcoin block height
   * In production, this would query a Bitcoin node or block explorer API
   */
  getCurrentBlockHeight(): number {
    // Mock implementation - increment slightly for testing
    this.mockCurrentBlock += Math.floor(Math.random() * 3);
    return this.mockCurrentBlock;
  }

  /**
   * Convert days to Bitcoin blocks (assuming 10-minute blocks)
   */
  daysToBlocks(days: number): number {
    return Math.floor(days * 144); // 144 blocks per day
  }

  /**
   * Convert Bitcoin blocks to approximate days
   */
  blocksToDays(blocks: number): number {
    return blocks / 144;
  }

  /**
   * Convert satoshis to Bitcoin
   */
  satoshisToBTC(satoshis: number): number {
    return satoshis / 100_000_000;
  }

  /**
   * Convert Bitcoin to satoshis
   */
  btcToSatoshis(btc: number): number {
    return Math.floor(btc * 100_000_000);
  }

  /**
   * Generate unique vault ID
   */
  generateVaultId(): string {
    return `vault-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a new inheritance vault
   */
  async createVault(
    ownerAddress: string,
    params: CreateVaultParams
  ): Promise<{ success: boolean; vaultId?: string; error?: string }> {
    try {
      // Validate beneficiaries
      const totalPercentage = params.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (totalPercentage !== 100) {
        return { success: false, error: 'Beneficiary percentages must sum to 100%' };
      }

      if (params.beneficiaries.length === 0) {
        return { success: false, error: 'At least one beneficiary is required' };
      }

      const currentBlock = this.getCurrentBlockHeight();
      const vault: InheritanceVault = {
        owner: ownerAddress,
        beneficiaries: params.beneficiaries,
        timeoutBlocks: params.timeoutBlocks,
        lastCheckin: currentBlock,
        vaultBalance: params.initialDeposit,
        status: VaultStatus.Active,
        vaultId: params.vaultId,
        createdAt: currentBlock,
      };

      this.vaults.set(params.vaultId, vault);

      // In production, this would:
      // 1. Create a Charms spell to lock Bitcoin in the vault UTXO
      // 2. Broadcast the transaction to Bitcoin network
      // 3. Wait for confirmation

      return { success: true, vaultId: params.vaultId };
    } catch (error) {
      return { success: false, error: `Failed to create vault: ${error}` };
    }
  }

  /**
   * Owner check-in to reset timeout
   */
  async checkIn(
    ownerAddress: string,
    params: CheckInParams
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.vaults.get(params.vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      if (vault.owner !== ownerAddress) {
        return { success: false, error: 'Only vault owner can check in' };
      }

      if (vault.status !== VaultStatus.Active) {
        return { success: false, error: 'Vault is not active' };
      }

      const currentBlock = this.getCurrentBlockHeight();

      // Check if vault has already expired
      if (currentBlock >= vault.lastCheckin + vault.timeoutBlocks) {
        vault.status = VaultStatus.Expired;
        return { success: false, error: 'Vault has already expired' };
      }

      // Update check-in
      vault.lastCheckin = currentBlock;
      if (params.newTimeoutBlocks) {
        vault.timeoutBlocks = params.newTimeoutBlocks;
      }

      // In production, this would create a Charms spell to update the UTXO state

      return { success: true };
    } catch (error) {
      return { success: false, error: `Check-in failed: ${error}` };
    }
  }

  /**
   * Add more Bitcoin to existing vault
   */
  async deposit(
    ownerAddress: string,
    vaultId: string,
    amount: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const vault = this.vaults.get(vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      if (vault.owner !== ownerAddress) {
        return { success: false, error: 'Only vault owner can deposit' };
      }

      if (vault.status !== VaultStatus.Active) {
        return { success: false, error: 'Vault is not active' };
      }

      vault.vaultBalance += amount;

      // In production, this would create a Charms spell to add Bitcoin to the vault UTXO

      return { success: true };
    } catch (error) {
      return { success: false, error: `Deposit failed: ${error}` };
    }
  }

  /**
   * Claim inheritance (called by beneficiary after timeout)
   */
  async claimInheritance(
    params: ClaimInheritanceParams
  ): Promise<{ success: boolean; amount?: number; error?: string }> {
    try {
      const vault = this.vaults.get(params.vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      if (vault.status !== VaultStatus.Active) {
        return { success: false, error: 'Vault is not active' };
      }

      const currentBlock = this.getCurrentBlockHeight();

      // Check if vault has expired
      if (currentBlock < vault.lastCheckin + vault.timeoutBlocks) {
        const remainingBlocks = vault.lastCheckin + vault.timeoutBlocks - currentBlock;
        const remainingDays = this.blocksToDays(remainingBlocks);
        return {
          success: false,
          error: `Vault has not expired yet. ${remainingDays.toFixed(1)} days remaining`
        };
      }

      // Find beneficiary
      const beneficiary = vault.beneficiaries.find(b => b.address === params.beneficiaryAddress);
      if (!beneficiary) {
        return { success: false, error: 'Address not found in beneficiaries' };
      }

      // Calculate inheritance amount
      const inheritanceAmount = Math.floor((vault.vaultBalance * beneficiary.percentage) / 100);

      // Mark vault as claimed (simplified - in practice, might allow partial claims)
      vault.status = VaultStatus.Claimed;

      // In production, this would create a Charms spell to transfer Bitcoin to beneficiary

      return { success: true, amount: inheritanceAmount };
    } catch (error) {
      return { success: false, error: `Claim failed: ${error}` };
    }
  }

  /**
   * Cancel vault and withdraw funds (owner only)
   */
  async cancelVault(
    ownerAddress: string,
    vaultId: string
  ): Promise<{ success: boolean; amount?: number; error?: string }> {
    try {
      const vault = this.vaults.get(vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      if (vault.owner !== ownerAddress) {
        return { success: false, error: 'Only vault owner can cancel' };
      }

      if (vault.status !== VaultStatus.Active) {
        return { success: false, error: 'Vault is not active' };
      }

      const withdrawAmount = vault.vaultBalance;
      vault.status = VaultStatus.Cancelled;
      vault.vaultBalance = 0;

      // In production, this would create a Charms spell to return Bitcoin to owner

      return { success: true, amount: withdrawAmount };
    } catch (error) {
      return { success: false, error: `Cancel failed: ${error}` };
    }
  }

  /**
   * Get all vaults for a user (owner or beneficiary)
   */
  getUserVaults(userAddress: string): InheritanceVault[] {
    const userVaults: InheritanceVault[] = [];

    for (const vault of this.vaults.values()) {
      // User is owner or beneficiary
      if (vault.owner === userAddress ||
          vault.beneficiaries.some(b => b.address === userAddress)) {
        userVaults.push({ ...vault }); // Return copy
      }
    }

    return userVaults;
  }

  /**
   * Get vault by ID
   */
  getVault(vaultId: string): InheritanceVault | null {
    const vault = this.vaults.get(vaultId);
    return vault ? { ...vault } : null;
  }

  /**
   * Check if vault has expired
   */
  isVaultExpired(vaultId: string): boolean {
    const vault = this.vaults.get(vaultId);
    if (!vault) return false;

    const currentBlock = this.getCurrentBlockHeight();
    return currentBlock >= vault.lastCheckin + vault.timeoutBlocks;
  }

  /**
   * Get time remaining for vault in blocks and days
   */
  getTimeRemaining(vaultId: string): { blocks: number; days: number; expired: boolean } {
    const vault = this.vaults.get(vaultId);
    if (!vault) {
      return { blocks: 0, days: 0, expired: true };
    }

    const currentBlock = this.getCurrentBlockHeight();
    const expirationBlock = vault.lastCheckin + vault.timeoutBlocks;

    if (currentBlock >= expirationBlock) {
      return { blocks: 0, days: 0, expired: true };
    }

    const remainingBlocks = expirationBlock - currentBlock;
    const remainingDays = this.blocksToDays(remainingBlocks);

    return {
      blocks: remainingBlocks,
      days: remainingDays,
      expired: false
    };
  }

  /**
   * Initialize demo vaults for development/testing
   */
  private initializeDemoVaults(): void {
    // Demo vault 1: Active vault with 30 days timeout
    const vault1: InheritanceVault = {
      owner: 'bc1qa5p9r8y2h3gx7vj6k4f5d3s2a1q9w8e7r6t5y',
      beneficiaries: [
        {
          address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
          percentage: 60,
          backupContact: 'heir1@example.com'
        },
        {
          address: 'bc1qrp33g4q4p2mdrhrzf7f4hs45k03v9f4ed5g3ap',
          percentage: 40,
          backupContact: 'heir2@example.com'
        }
      ],
      timeoutBlocks: this.daysToBlocks(30), // 30 days
      lastCheckin: this.mockCurrentBlock - 100, // Checked in 100 blocks ago
      vaultBalance: this.btcToSatoshis(1.5), // 1.5 BTC
      status: VaultStatus.Active,
      vaultId: 'demo-vault-1',
      createdAt: this.mockCurrentBlock - 1000,
    };

    // Demo vault 2: Nearly expired vault
    const vault2: InheritanceVault = {
      owner: 'bc1qa5p9r8y2h3gx7vj6k4f5d3s2a1q9w8e7r6t5y',
      beneficiaries: [
        {
          address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
          percentage: 100,
        }
      ],
      timeoutBlocks: this.daysToBlocks(7), // 7 days
      lastCheckin: this.mockCurrentBlock - this.daysToBlocks(6.5), // Nearly expired
      vaultBalance: this.btcToSatoshis(0.25), // 0.25 BTC
      status: VaultStatus.Active,
      vaultId: 'demo-vault-2',
      createdAt: this.mockCurrentBlock - 2000,
    };

    this.vaults.set(vault1.vaultId, vault1);
    this.vaults.set(vault2.vaultId, vault2);
  }

  /**
   * Format time remaining as human-readable string
   */
  formatTimeRemaining(vaultId: string): string {
    const { blocks, days, expired } = this.getTimeRemaining(vaultId);

    if (expired) {
      return 'Expired';
    }

    if (days < 1) {
      const hours = Math.floor((blocks / 144) * 24);
      return `${hours}h remaining`;
    } else if (days < 7) {
      return `${Math.floor(days)}d ${Math.floor((days % 1) * 24)}h remaining`;
    } else {
      const weeks = Math.floor(days / 7);
      const remainingDays = Math.floor(days % 7);
      return `${weeks}w ${remainingDays}d remaining`;
    }
  }
}

// Singleton instance for the app
export const bitcoinVault = new BitcoinVaultManager();
