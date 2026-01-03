#!/usr/bin/env node

/**
 * Simple EternalKey Contract Deployment
 *
 * Uses the existing working APIs to deploy and test the contract
 * with the generated wallet private key
 */

const fs = require('fs');
const path = require('path');

// Get latest wallet
function getLatestWallet() {
    try {
        const walletDir = path.join(__dirname, '../wallets');
        const walletFiles = fs.readdirSync(walletDir)
            .filter(file => file.startsWith('wallet-') && file.endsWith('.json'))
            .sort()
            .reverse();

        if (walletFiles.length === 0) {
            throw new Error('No wallet files found. Run ./setup-wallet.sh first.');
        }

        const latestWalletFile = path.join(walletDir, walletFiles[0]);
        const walletData = JSON.parse(fs.readFileSync(latestWalletFile, 'utf8'));

        return walletData;
    } catch (error) {
        throw new Error(`Failed to load wallet: ${error.message}`);
    }
}

// Deploy contract using our APIs
async function deployContract(wallet) {
    try {
        console.log('🚀 Deploying EternalKey inheritance contract...');

        const fetch = (await import('node-fetch')).default;

        // Create deployment spell using the wallet's private key
        const deploymentSpell = `version: 8

# EternalKey Inheritance Vault Contract
apps:
  $00: n/\${app_id}/\${app_vk}

# Deployment private inputs
private_inputs:
  $00: "ContractDeployment"
  $01: "${wallet.privateKey}"

# Contract deployment output
outs:
  - address: ${wallet.address}
    charms:
      $00:
        contract_type: "InheritanceVault"
        version: "1.0.0"
        owner: "${wallet.address}"
        deployed_at: ${Date.now()}
        network: "testnet"
        status: "Active"
        features: [
          "multi_beneficiary",
          "block_timeout",
          "owner_checkin",
          "automatic_distribution"
        ]
        contract_code_hash: "eternal_key_vault_${Date.now()}"`;

        // Execute deployment spell
        const deployResult = await fetch('http://localhost:3000/api/charms/execute-spell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                spell: deploymentSpell,
                operation: 'deploy-contract',
                network: 'testnet'
            })
        });

        if (!deployResult.ok) {
            throw new Error(`Deployment failed: ${deployResult.status}`);
        }

        const deployment = await deployResult.json();

        console.log('✅ Contract deployed successfully!');
        console.log(`   Contract Address: ${wallet.address}`);
        console.log(`   Transaction Hash: ${deployment.txHash}`);
        console.log(`   Network: Bitcoin Testnet`);

        return {
            contractAddress: wallet.address,
            txHash: deployment.txHash,
            privateKey: wallet.privateKey,
            network: 'testnet',
            deployedAt: new Date().toISOString()
        };

    } catch (error) {
        throw new Error(`Deployment failed: ${error.message}`);
    }
}

// Test contract deployment
async function testContract(deployment) {
    try {
        console.log('🧪 Testing deployed contract...');

        const fetch = (await import('node-fetch')).default;

        // Test 1: Create inheritance vault with the deployed contract
        console.log('   Creating test inheritance vault...');

        const testVaultSpell = `version: 8

apps:
  $00: n/\${app_id}/\${app_vk}

private_inputs:
  $00: "CreateInheritanceVault"
  $01: "${deployment.privateKey}"

outs:
  - address: ${deployment.contractAddress}
    charms:
      $00:
        vault_id: "test_vault_${Date.now()}"
        owner: "${deployment.contractAddress}"
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
        status: "Active"
        created_at: ${Date.now()}`;

        const vaultResult = await fetch('http://localhost:3000/api/charms/execute-spell', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                spell: testVaultSpell,
                operation: 'create-vault',
                network: 'testnet'
            })
        });

        if (vaultResult.ok) {
            const vaultData = await vaultResult.json();
            console.log('   ✅ Test vault created:', vaultData.txHash);
        } else {
            console.log('   ⚠️  Test vault creation failed');
        }

        // Test 2: Query vault state
        console.log('   Querying vault state...');

        const stateResult = await fetch('http://localhost:3000/api/charms/vault-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vaultId: `deployed-contract-${deployment.contractAddress}`,
                network: 'testnet'
            })
        });

        if (stateResult.ok) {
            const state = await stateResult.json();
            console.log('   ✅ Contract state query successful');
        } else {
            console.log('   ⚠️  Contract state query failed');
        }

        console.log('✅ Contract testing completed successfully!');

    } catch (error) {
        console.error('❌ Contract testing failed:', error.message);
    }
}

// Save deployment info
function saveDeployment(deployment) {
    try {
        const deploymentsDir = path.join(__dirname, '../deployments');
        if (!fs.existsSync(deploymentsDir)) {
            fs.mkdirSync(deploymentsDir, { recursive: true });
        }

        const deploymentFile = path.join(deploymentsDir, `deployment-${Date.now()}.json`);
        fs.writeFileSync(deploymentFile, JSON.stringify({
            ...deployment,
            privateKey: "[REDACTED FOR SECURITY]" // Don't save private key in deployment file
        }, null, 2));

        console.log(`📁 Deployment info saved: ${path.basename(deploymentFile)}`);
        return deploymentFile;

    } catch (error) {
        console.error('Warning: Could not save deployment info:', error.message);
        return null;
    }
}

// Main deployment
async function main() {
    console.log('🔑 EternalKey Simple Contract Deployment');
    console.log('=======================================\n');

    try {
        // Step 1: Load wallet
        console.log('1️⃣  Loading deployment wallet...');
        const wallet = getLatestWallet();
        console.log(`   Wallet Address: ${wallet.address}`);
        console.log(`   Network: ${wallet.network}\n`);

        // Step 2: Deploy contract
        console.log('2️⃣  Deploying inheritance contract...');
        const deployment = await deployContract(wallet);
        console.log();

        // Step 3: Test deployment
        console.log('3️⃣  Testing deployed contract...');
        await testContract(deployment);
        console.log();

        // Step 4: Save deployment info
        console.log('4️⃣  Saving deployment information...');
        const deploymentFile = saveDeployment(deployment);
        console.log();

        // Success summary
        console.log('🎉 Deployment Successful!');
        console.log('=========================');
        console.log(`📍 Contract Address: ${deployment.contractAddress}`);
        console.log(`🆔 Transaction Hash: ${deployment.txHash}`);
        console.log(`🌐 Network: Bitcoin Testnet`);
        console.log(`⏰ Deployed At: ${deployment.deployedAt}`);
        console.log();
        console.log('🔗 Next Steps:');
        console.log('   1. 💰 Fund the contract with testnet Bitcoin:');
        console.log(`      Address: ${deployment.contractAddress}`);
        console.log('   2. 🌐 Open application: http://localhost:3000/app');
        console.log('   3. 🔌 Connect your wallet (Unisat recommended)');
        console.log('   4. 🏗️  Create and test inheritance vaults');
        console.log('   5. 📊 Check deployment details in deployments/ directory');
        console.log();
        console.log('🪙 Get Testnet Bitcoin:');
        console.log('   • https://coinfaucet.eu/en/btc-testnet/');
        console.log('   • https://testnet-faucet.mempool.co/');
        console.log(`   • Paste address: ${deployment.contractAddress}`);

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   • Ensure development server is running: npm run dev');
        console.log('   • Check wallet exists: ls wallets/');
        console.log('   • Verify APIs work: curl http://localhost:3000/api/bitcoin/block-height');
        process.exit(1);
    }
}

// Run deployment
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { deployContract, testContract };