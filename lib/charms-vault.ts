// Frontend-compatible Charms vault management

export interface InheritanceVault {
  owner: string;
  beneficiaries: Beneficiary[];
  timeout_blocks: number;
  last_checkin: number;
  vault_balance: number;
  status: VaultStatus;
  vault_id: string;
  created_at: number;
}

export interface Beneficiary {
  address: string;
  percentage: number;
  name: string;
}

export enum VaultStatus {
  Active = "Active",
  Locked = "Locked",
  Claiming = "Claiming",
  Claimed = "Claimed"
}

export interface CreateVaultParams {
  ownerAddress: string;
  beneficiaries: Beneficiary[];
  timeoutBlocks: number;
}

export interface VaultOperation {
  type: 'create' | 'deposit' | 'checkin' | 'claim';
  vaultId?: string;
  amount?: number;
  beneficiaryAddress?: string;
}

export class CharmsVaultManager {
  private initialized: boolean = false;

  constructor() {
    // Frontend-compatible constructor
  }

  async init(): Promise<void> {
    try {
      // Initialize frontend-compatible Charms manager
      this.initialized = true;
      console.log('Charms Vault Manager initialized');
    } catch (error) {
      console.error('Failed to initialize Charms Vault Manager:', error);
      throw error;
    }
  }

  async createVault(params: CreateVaultParams): Promise<{
    success: boolean;
    vaultId?: string;
    txHash?: string;
    error?: string;
  }> {
    try {
      // Validate beneficiaries total percentage
      const totalPercentage = params.beneficiaries.reduce((sum, b) => sum + b.percentage, 0);
      if (totalPercentage !== 100) {
        return {
          success: false,
          error: `Beneficiaries percentages must sum to 100%, got ${totalPercentage}%`
        };
      }

      // Generate unique vault ID
      const vaultId = this.generateVaultId(params.ownerAddress);

      // Get current block height (mock for now)
      const currentBlock = await this.getCurrentBlockHeight();

      // Create spell file
      const spellData = await this.createVaultSpell({
        vaultId,
        ownerAddress: params.ownerAddress,
        beneficiaries: params.beneficiaries,
        timeoutBlocks: params.timeoutBlocks,
        currentBlock
      });

      // Execute the spell using Charms
      const result = await this.executeSpell(spellData, 'create-vault');

      if (result.success) {
        return {
          success: true,
          vaultId,
          txHash: result.txHash
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to create vault'
        };
      }
    } catch (error) {
      console.error('Error creating vault:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async depositToVault(vaultId: string, amount: number): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      // Get current vault state
      const vault = await this.getVaultState(vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      // Create deposit spell
      const spellData = await this.createDepositSpell({
        vaultId,
        vault,
        depositAmount: amount
      });

      // Execute the spell
      const result = await this.executeSpell(spellData, 'deposit');

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async checkinVault(vaultId: string, ownerAddress: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      const vault = await this.getVaultState(vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      if (vault.owner !== ownerAddress) {
        return { success: false, error: 'Only vault owner can check in' };
      }

      const currentBlock = await this.getCurrentBlockHeight();

      const spellData = await this.createCheckinSpell({
        vaultId,
        vault,
        currentBlock
      });

      const result = await this.executeSpell(spellData, 'checkin');
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async claimVault(vaultId: string, beneficiaryAddress: string): Promise<{
    success: boolean;
    txHash?: string;
    claimedAmount?: number;
    error?: string;
  }> {
    try {
      const vault = await this.getVaultState(vaultId);
      if (!vault) {
        return { success: false, error: 'Vault not found' };
      }

      // Verify beneficiary
      const beneficiary = vault.beneficiaries.find(b => b.address === beneficiaryAddress);
      if (!beneficiary) {
        return { success: false, error: 'Not a valid beneficiary' };
      }

      // Check if timeout has passed
      const currentBlock = await this.getCurrentBlockHeight();
      if (currentBlock < vault.last_checkin + vault.timeout_blocks) {
        const blocksRemaining = (vault.last_checkin + vault.timeout_blocks) - currentBlock;
        return {
          success: false,
          error: `Vault timeout not reached. ${blocksRemaining} blocks remaining.`
        };
      }

      // Calculate claim amount
      const claimAmount = Math.floor(vault.vault_balance * beneficiary.percentage / 100);

      const spellData = await this.createClaimSpell({
        vaultId,
        vault,
        beneficiaryAddress,
        claimAmount
      });

      const result = await this.executeSpell(spellData, 'claim');

      if (result.success) {
        return {
          success: true,
          txHash: result.txHash,
          claimedAmount: claimAmount
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getVaultState(vaultId: string): Promise<InheritanceVault | null> {
    try {
      // Query Bitcoin testnet for vault state via API
      const response = await fetch('/api/charms/vault-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultId: vaultId,
          network: 'testnet'
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch vault state:', response.status);
        return null;
      }

      const vaultState = await response.json();
      return vaultState.vault;
    } catch (error) {
      console.error('Error getting vault state:', error);
      return null;
    }
  }

  async getVaultsByOwner(ownerAddress: string): Promise<InheritanceVault[]> {
    try {
      // Query all vaults owned by this address
      const response = await fetch('/api/charms/vaults-by-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerAddress: ownerAddress,
          network: 'testnet'
        })
      });

      if (!response.ok) {
        console.error('Failed to fetch vaults by owner:', response.status);
        return [];
      }

      const vaultsData = await response.json();
      return vaultsData.vaults || [];
    } catch (error) {
      console.error('Error getting vaults by owner:', error);
      return [];
    }
  }

  private generateVaultId(ownerAddress: string): string {
    const timestamp = Date.now();
    const data = `${ownerAddress}-${timestamp}`;
    // Simple browser-compatible hash - in production use Web Crypto API
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(16, '0').substring(0, 16);
  }

  private async getCurrentBlockHeight(): Promise<number> {
    try {
      // Query current Bitcoin testnet block height
      const response = await fetch('/api/bitcoin/block-height');
      if (response.ok) {
        const data = await response.json();
        return data.blockHeight;
      }
    } catch (error) {
      console.error('Error fetching block height:', error);
    }

    // Fallback: calculate approximate testnet block height
    const testnetStartBlock = 2800000; // approximate testnet block as of Jan 2024
    const blocksPerDay = 144; // 10 min average
    const daysSinceStart = Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24));

    return testnetStartBlock + (blocksPerDay * daysSinceStart);
  }

  private async createVaultSpell(params: {
    vaultId: string;
    ownerAddress: string;
    beneficiaries: Beneficiary[];
    timeoutBlocks: number;
    currentBlock: number;
  }): Promise<string> {
    // Create the spell YAML content for Charms Protocol
    const spell = `version: 8

apps:
  $00: n/\${app_id}/\${app_vk}

private_inputs:
  $00: "\${in_utxo_0}"

ins:
  - utxo_id: \${in_utxo_0}
    charms: {}

outs:
  - address: \${addr_0}
    charms:
      $00:
        owner: ${params.ownerAddress}
        beneficiaries: ${JSON.stringify(params.beneficiaries)}
        timeout_blocks: ${params.timeoutBlocks}
        last_checkin: ${params.currentBlock}
        vault_balance: 0
        status: Active
        vault_id: ${params.vaultId}
        created_at: ${Date.now()}`;

    console.log('Generated spell YAML for vault creation:', spell);
    return spell;
  }

  private async createDepositSpell(params: {
    vaultId: string;
    vault: InheritanceVault;
    depositAmount: number;
  }): Promise<string> {
    const newBalance = params.vault.vault_balance + params.depositAmount;

    const spell = `version: 8

apps:
  $00: n/\${app_id}/\${app_vk}
  $01: t/\${app_id}/\${app_vk}

private_inputs:
  $00: "Deposit"

ins:
  - utxo_id: \${vault_utxo}
    charms:
      $00: ${JSON.stringify(params.vault)}
  - utxo_id: \${deposit_utxo}
    value: ${params.depositAmount}

outs:
  - address: \${addr_0}
    charms:
      $00: ${JSON.stringify({
        ...params.vault,
        vault_balance: newBalance
      })}
      $01: ${params.depositAmount}`;

    console.log('Generated deposit spell YAML:', spell);
    return spell;
  }

  private async createCheckinSpell(params: {
    vaultId: string;
    vault: InheritanceVault;
    currentBlock: number;
  }): Promise<string> {
    const spell = `version: 8

apps:
  $00: n/\${app_id}/\${app_vk}

private_inputs:
  $00: "Checkin"

ins:
  - utxo_id: \${vault_utxo}
    charms:
      $00: ${JSON.stringify(params.vault)}

outs:
  - address: \${addr_0}
    charms:
      $00: ${JSON.stringify({
        ...params.vault,
        last_checkin: params.currentBlock
      })}`;

    console.log('Generated checkin spell YAML:', spell);
    return spell;
  }

  private async createClaimSpell(params: {
    vaultId: string;
    vault: InheritanceVault;
    beneficiaryAddress: string;
    claimAmount: number;
  }): Promise<string> {
    const spell = `version: 8

apps:
  $00: n/\${app_id}/\${app_vk}
  $01: t/\${app_id}/\${app_vk}

private_inputs:
  $00: "Claim"

ins:
  - utxo_id: \${vault_utxo}
    charms:
      $00: ${JSON.stringify(params.vault)}
      $01: ${params.vault.vault_balance}

outs:
  - address: ${params.beneficiaryAddress}
    charms:
      $01: ${params.claimAmount}
  - address: \${addr_0}
    charms:
      $00: ${JSON.stringify({
        ...params.vault,
        vault_balance: 0,
        status: VaultStatus.Claimed
      })}`;

    console.log('Generated claim spell YAML:', spell);
    return spell;
  }

  private async executeSpell(spell: string, operation: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    try {
      console.log(`Executing ${operation} spell:`);
      console.log('Spell YAML:', spell);

      // In browser, we'll need to send this to a backend service
      // For now, create a realistic testnet transaction simulation
      const response = await fetch('/api/charms/execute-spell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spell: spell,
          operation: operation,
          network: 'testnet'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: result.success,
        txHash: result.txHash,
        error: result.error
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Spell execution failed'
      };
    }
  }
}

export default CharmsVaultManager;
