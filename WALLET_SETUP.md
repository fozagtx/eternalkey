# 🪙 Bitcoin Testnet Wallet Setup for EternalKey

This guide helps you set up a Bitcoin testnet wallet to test the EternalKey inheritance vault functionality.

## Quick Start

### Option 1: Automated Setup Script (Recommended)

```bash
# Run the automated setup script
./setup-wallet.sh
```

This script will:
- Generate a new Bitcoin testnet wallet
- Test the connection to EternalKey APIs
- Create a sample inheritance vault
- Provide funding instructions

### Option 2: Manual Setup

```bash
# Generate wallet and test APIs
node scripts/setup-testnet-wallet.js
```

## What the Script Does

### 1. **Wallet Generation**
- Creates a new Bitcoin testnet address (tb1q... format)
- Generates a private key for testing
- Saves wallet details to `wallets/` directory

### 2. **API Testing**
- Tests connection to EternalKey vault state API
- Tests spell execution API
- Creates a sample inheritance vault

### 3. **Funding Instructions**
Provides links to Bitcoin testnet faucets:
- [Coinfaucet.eu](https://coinfaucet.eu/en/btc-testnet/)
- [Mempool Testnet Faucet](https://testnet-faucet.mempool.co/)
- [Bitcoin Faucet](https://bitcoinfaucet.uo1.net/)

## Generated Files

```
wallets/
└── wallet-[timestamp].json    # Contains address and private key
```

**Example wallet file:**
```json
{
  "privateKey": "a1b2c3d4e5f6...",
  "address": "tb1qb55df1e19a57fa98938f2e776abd07ed",
  "network": "testnet"
}
```

## Testing Workflow

### 1. Generate Wallet
```bash
./setup-wallet.sh
```

### 2. Fund the Wallet
1. Copy the generated testnet address
2. Visit a testnet faucet
3. Paste the address and request funds
4. Wait for confirmation (10-60 minutes)

### 3. Check Balance
Visit: `https://blockstream.info/testnet/address/[your-address]`

### 4. Test EternalKey
1. Open http://localhost:3000/app
2. Connect wallet (Unisat recommended)
3. Create inheritance vaults
4. Test vault functionality

## Wallet Integration

### Browser Wallet Extensions

**Recommended: Unisat Wallet**
- Install from https://unisat.io
- Switch to testnet mode
- Import private key from generated wallet

**Alternative: Xverse**
- Install from https://www.xverse.app
- Switch to testnet
- Import private key

### Manual Testing
You can also test directly with the generated address:
```bash
# Test vault creation with your address
curl -X POST http://localhost:3000/api/charms/execute-spell \
  -H "Content-Type: application/json" \
  -d '{
    "spell": "...",
    "operation": "create-vault",
    "network": "testnet"
  }'
```

## Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

- **TESTNET ONLY**: Never use these wallets on Bitcoin mainnet
- **Development Only**: Private keys are stored in plain text
- **Delete After Testing**: Remove wallet files when done testing
- **No Real Value**: Testnet Bitcoin has no monetary value

## Example Output

```
🪙 Bitcoin Testnet Wallet Generator for EternalKey
================================================

1️⃣  Generating new testnet wallet...
✅ Wallet generated successfully!
   Address: tb1qb55df1e19a57fa98938f2e776abd07ed
   Network: testnet

2️⃣  Funding wallet with testnet tokens...
   📋 Copy this address: tb1qb55df1e19a57fa98938f2e776abd07ed

🔗 Testing EternalKey API connection...
✅ EternalKey API connection successful

🏗️  Creating sample inheritance vault...
✅ Sample vault created successfully
   Transaction Hash: btc-testnet-create-vault-1767459377434-u7dk18
```

## Troubleshooting

### Development Server Not Running
```
⚠️  EternalKey development server is not running.
```
**Solution:** Start the dev server first:
```bash
npm run dev
```

### API Connection Failed
```
⚠️  EternalKey API connection failed: 500
```
**Solution:** Check that the development server is running and APIs are working.

### Node.js Not Found
```
❌ Node.js is not installed.
```
**Solution:** Install Node.js from https://nodejs.org

## Integration with EternalKey

The generated wallet can be used to:

1. **Connect Browser Wallet**: Import the private key into Unisat/Xverse
2. **Create Vaults**: Set up inheritance vaults with beneficiaries
3. **Test Timeouts**: Test the dead-man's switch functionality
4. **Test Claims**: Simulate beneficiary claims after timeout
5. **API Testing**: Direct API calls for development

## Next Steps

After setting up your wallet:

1. 📱 **Install Unisat**: Download and install Unisat wallet extension
2. 💰 **Fund Wallet**: Use testnet faucets to get test Bitcoin
3. 🔗 **Connect**: Visit http://localhost:3000/app and connect wallet
4. 🏗️ **Create Vault**: Set up your first inheritance vault
5. 🧪 **Test**: Explore all the EternalKey features

---

**Happy Testing with EternalKey! 🚀**