#!/usr/bin/env node

/**
 * Bitcoin Testnet Wallet Setup Script
 *
 * This script:
 * 1. Generates a new Bitcoin testnet wallet
 * 2. Provides instructions for funding with testnet tokens
 * 3. Tests the wallet connection with EternalKey
 * 4. Creates a sample inheritance vault
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Bitcoin testnet address generation (simplified)
function generateTestnetWallet() {
    // Generate random private key
    const privateKey = crypto.randomBytes(32);

    // Create a simplified testnet address (tb1q format)
    // In production, use proper Bitcoin libraries like bitcoinjs-lib
    const hash = crypto.createHash('sha256').update(privateKey).digest();
    const addressHash = crypto.createHash('ripemd160').update(hash).digest();

    // Convert to bech32-like format (simplified)
    const hexAddress = addressHash.toString('hex');
    const testnetAddress = `tb1q${hexAddress.slice(0, 32)}`;

    return {
        privateKey: privateKey.toString('hex'),
        address: testnetAddress,
        network: 'testnet'
    };
}

// Save wallet to file
function saveWallet(wallet) {
    const walletDir = path.join(__dirname, '../wallets');
    if (!fs.existsSync(walletDir)) {
        fs.mkdirSync(walletDir, { recursive: true });
    }

    const walletFile = path.join(walletDir, `wallet-${Date.now()}.json`);
    fs.writeFileSync(walletFile, JSON.stringify(wallet, null, 2));

    return walletFile;
}

// Test EternalKey API connection
async function testEternalKeyConnection(address) {
    const fetch = (await import('node-fetch')).default;

    try {
        console.log('🔗 Testing EternalKey API connection...');

        // Test vault state API
        const response = await fetch('http://localhost:3000/api/charms/vault-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vaultId: `test-vault-${address}`,
                network: 'testnet'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ EternalKey API connection successful');
            return data;
        } else {
            console.log('⚠️  EternalKey API connection failed:', response.status);
            return null;
        }
    } catch (error) {
        console.log('⚠️  Could not connect to EternalKey API:', error.message);
        console.log('   Make sure to run "npm run dev" in the EternalKey directory');
        return null;
    }
}

// Create sample vault
async function createSampleVault(ownerAddress) {
    const fetch = (await import('node-fetch')).default;

    try {
        console.log('🏗️  Creating sample inheritance vault...');

        // Generate spell for vault creation
        const spell = `version: 8

apps:
  $00: n/\${app_id}/\${app_vk}

outs:
  - address: ${ownerAddress}
    charms:
      $00:
        owner: ${ownerAddress}
        beneficiaries: [
          {
            "address": "tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3",
            "percentage": 60,
            "name": "Primary Beneficiary"
          },
          {
            "address": "tb1qqqqqq0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qfpyssf",
            "percentage": 40,
            "name": "Secondary Beneficiary"
          }
        ]
        timeout_blocks: 144
        last_checkin: ${Math.floor(Date.now() / 1000)}
        vault_balance: 0
        status: Active
        vault_id: vault-${ownerAddress}
        created_at: ${Date.now()}`;

        const response = await fetch('http://localhost:3000/api/charms/execute-spell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                spell: spell,
                operation: 'create-vault',
                network: 'testnet'
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sample vault created successfully');
            console.log('   Transaction Hash:', data.txHash);
            return data;
        } else {
            console.log('⚠️  Failed to create vault:', response.status);
            return null;
        }
    } catch (error) {
        console.log('⚠️  Error creating vault:', error.message);
        return null;
    }
}

// Main execution
async function main() {
    console.log('🪙 Bitcoin Testnet Wallet Generator for EternalKey');
    console.log('================================================\n');

    // Step 1: Generate wallet
    console.log('1️⃣  Generating new testnet wallet...');
    const wallet = generateTestnetWallet();
    console.log('✅ Wallet generated successfully!');
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Network: ${wallet.network}`);

    // Step 2: Save wallet
    const walletFile = saveWallet(wallet);
    console.log(`   Saved to: ${walletFile}\n`);

    // Step 3: Funding instructions
    console.log('2️⃣  Funding wallet with testnet tokens...');
    console.log('   To get testnet Bitcoin, visit these faucets:');
    console.log('   • https://coinfaucet.eu/en/btc-testnet/');
    console.log('   • https://testnet-faucet.mempool.co/');
    console.log('   • https://bitcoinfaucet.uo1.net/');
    console.log(`
   📋 Copy this address: ${wallet.address}

   ⚠️  IMPORTANT: Wait for the transaction to confirm (usually 10-60 minutes)
       You can check confirmation status at: https://blockstream.info/testnet/address/${wallet.address}
   `);

    // Step 4: Test EternalKey connection
    const vaultData = await testEternalKeyConnection(wallet.address);

    // Step 5: Create sample vault
    if (vaultData) {
        await createSampleVault(wallet.address);
    }

    console.log('\n🎉 Setup complete! Next steps:');
    console.log('   1. Fund the wallet using the faucets above');
    console.log('   2. Wait for confirmation (check blockstream link)');
    console.log('   3. Open http://localhost:3000/app in your browser');
    console.log('   4. Use a wallet browser extension (Unisat recommended)');
    console.log('   5. Import the private key or use generated address for testing');
    console.log('\n📁 Wallet details saved to:', walletFile);

    // Security warning
    console.log('\n⚠️  SECURITY WARNING:');
    console.log('   • This is for TESTNET only - never use on mainnet');
    console.log('   • Private key is saved in plain text for development');
    console.log('   • Delete wallet files after testing');
}

// Run the script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { generateTestnetWallet, testEternalKeyConnection, createSampleVault };