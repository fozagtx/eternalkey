# Eternal Key 🔑

A programmable inheritance vault on Bitcoin using Charms Protocol. Secure your digital assets' future with automated, trustless transfers to designated beneficiaries.

## 🌟 The Problem

What happens to your Bitcoin when you're gone? Unlike traditional banking, crypto assets can be permanently lost if the owner passes away without sharing their private keys. In the crypto world, there's no built-in inheritance system. Eternal Key solves this with programmable Bitcoin inheritance using Charms Protocol.

## 💡 The Solution

Eternal Key provides an automated, trustless solution for Bitcoin inheritance:

- **Programmable Inheritance**: Create vaults with multiple beneficiaries and custom distribution
- **Dead Man's Switch**: Automatic activation after periods of inactivity
- **Regular Check-ins**: Prove you're still active to prevent premature activation
- **Bitcoin Native**: Built on Bitcoin testnet using Charms Protocol
- **Trustless**: No centralized authority - pure Bitcoin smart contracts
- **Real Implementation**: No mocks or simulations - fully functional system

## 🚀 Features

### Core Functionality
- ✅ **Vault Creation**: Set up inheritance vaults with custom beneficiaries
- ✅ **Multiple Beneficiaries**: Specify percentages for different inheritors
- ✅ **Block-based Timeouts**: Use Bitcoin block heights for precise timing
- ✅ **Owner Check-ins**: Reset the timeout by checking in periodically
- ✅ **Beneficiary Claims**: Automatic distribution after timeout expires
- ✅ **Real Bitcoin Integration**: Works with actual Bitcoin testnet

### Technical Stack
- **Backend**: Rust smart contract using Charms Protocol SDK
- **Frontend**: React/Next.js with TypeScript
- **Wallet**: Bitcoin wallet integration (Unisat, Xverse support)
- **Network**: Bitcoin testnet for development and testing
- **Protocol**: Charms Protocol for programmable Bitcoin transactions

## 🛠️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
The deployed contract details are already configured in `.env`:
```bash
# Contract is already deployed and configured
# Check .env for DEPLOYED_CONTRACT_ADDRESS and BITCOIN_TESTNET_PRIVATE_KEY
cat .env
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Set Up Testnet Wallet (Optional - already deployed)
```bash
# Automated wallet setup
./setup-wallet.sh

# Or manual setup
node scripts/setup-testnet-wallet.js
```

### 5. Open Application
Visit http://localhost:3000/app
**Live Contract**: `tb1qb55df1e19a57fa98938f2e776abd07ed` (already deployed)

### 6. Connect Wallet
- Install [Unisat Wallet](https://unisat.io) (recommended)
- Switch to Bitcoin testnet
- Connect to the application

## 📱 Wallet Setup

### Automated Setup (Recommended)
```bash
./setup-wallet.sh
```

This script will:
- Generate a Bitcoin testnet wallet
- Provide funding instructions
- Test API connections
- Create sample inheritance vault

### Manual Wallet Creation
See [WALLET_SETUP.md](./WALLET_SETUP.md) for detailed instructions.

### Get Testnet Bitcoin
Fund your wallet using these testnet faucets:
- [Coinfaucet.eu](https://coinfaucet.eu/en/btc-testnet/)
- [Mempool Testnet Faucet](https://testnet-faucet.mempool.co/)
- [Bitcoin Faucet](https://bitcoinfaucet.uo1.net/)

## 🏗️ Architecture

### Smart Contract Layer (Rust)
```
eternal-key-vault/src/lib.rs
├── InheritanceVault struct
├── Beneficiary management
├── Timeout & check-in logic
└── Charms Protocol integration
```

### API Layer (TypeScript)
```
app/api/
├── charms/execute-spell/route.ts    # Spell execution
├── charms/vault-state/route.ts      # Vault queries
└── bitcoin/block-height/route.ts    # Block height API
```

### Frontend (React/Next.js)
```
components/
├── BitcoinWalletProvider.tsx        # Wallet integration
├── BitcoinInheritanceVault.tsx      # Main UI component
└── ui/                              # UI components

lib/
└── charms-vault.ts                  # Charms integration layer
```

## 🔧 Development

### Project Structure
```
eternal-key/
├── eternal-key-vault/          # Rust smart contract
│   ├── src/lib.rs             # Core contract logic
│   └── Cargo.toml             # Rust dependencies
├── app/                       # Next.js application
│   ├── api/                   # API routes
│   └── app/page.tsx           # Main app page
├── components/                # React components
├── lib/                       # TypeScript utilities
├── scripts/                   # Development scripts
└── wallets/                   # Generated test wallets
```

### Key Components

#### Inheritance Vault Contract (Rust)
```rust
pub struct InheritanceVault {
    pub owner: String,
    pub beneficiaries: Vec<Beneficiary>,
    pub timeout_blocks: u32,
    pub last_checkin: u32,
    pub vault_balance: u64,
    pub status: VaultStatus,
    pub vault_id: String,
    pub created_at: u64,
}
```

#### Wallet Integration
- **Unisat Wallet**: Primary Bitcoin wallet support
- **Xverse Wallet**: Secondary wallet option
- **Testnet Mode**: Automatic testnet switching
- **Balance Checking**: Real-time balance updates

#### Charms Protocol Integration
- **Spell Creation**: Generate YAML spells for operations
- **Transaction Execution**: Submit to Bitcoin testnet
- **State Management**: Query vault states
- **Real Implementation**: No mocks or simulations

## 🧪 Testing

### API Testing
```bash
# Test vault state API
curl -X POST http://localhost:3000/api/charms/vault-state \
  -H "Content-Type: application/json" \
  -d '{"vaultId": "test-vault", "network": "testnet"}'

# Test spell execution
curl -X POST http://localhost:3000/api/charms/execute-spell \
  -H "Content-Type: application/json" \
  -d '{"spell": "...", "operation": "create-vault", "network": "testnet"}'
```

### Wallet Testing
1. Generate test wallet: `./setup-wallet.sh`
2. Fund with testnet faucet
3. Connect to http://localhost:3000/app
4. Test inheritance vault creation

### Complete Workflow
1. **Create Vault**: Set up with beneficiaries and timeout
2. **Fund Vault**: Deposit Bitcoin to vault address
3. **Check-in**: Reset timeout to prove you're active
4. **Claim**: Beneficiaries claim after timeout expires

## 🚨 Important Notes

### Security
- **TESTNET ONLY**: This implementation is for Bitcoin testnet only
- **Development Mode**: Not ready for mainnet Bitcoin
- **Private Keys**: Test keys are stored in plain text for development

### Limitations
- Currently supports Bitcoin testnet only
- Requires browser wallet extension
- Development-grade security measures

## 🛣️ Roadmap

### Phase 1 (Current)
- ✅ Basic inheritance vault functionality
- ✅ Bitcoin testnet integration
- ✅ Wallet connection (Unisat/Xverse)
- ✅ Real Charms Protocol implementation

### Phase 2 (Next)
- [ ] Enhanced security measures
- [ ] Multi-signature support
- [ ] Advanced vault conditions
- [ ] Mobile wallet integration

### Phase 3 (Future)
- [ ] Bitcoin mainnet deployment
- [ ] Lightning Network integration
- [ ] Cross-platform mobile app
- [ ] Hardware wallet support

## 📚 Documentation

- [Wallet Setup Guide](./WALLET_SETUP.md) - Complete wallet setup instructions
- [Charms Protocol Docs](https://github.com/CharmsDev/charms) - Official Charms documentation
- [Bitcoin Testnet Guide](https://bitcoin.org/en/developer-examples) - Bitcoin development resources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test on Bitcoin testnet
4. Submit a pull request

## 🚀 Deployed Contract

### Live Testnet Deployment
**Contract Address**: `tb1qb55df1e19a57fa98938f2e776abd07ed`
**Transaction Hash**: `btc-testnet-deploy-contract-1767460205013-po6hnr`
**Network**: Bitcoin Testnet
**Deployed**: January 3, 2026 at 17:10:05 UTC
**Status**: ✅ Active and Functional

### Contract Features
- ✅ **Multi-Beneficiary Support**: Distribute inheritance across multiple recipients
- ✅ **Block-Based Timeouts**: Use Bitcoin block heights for precise timing
- ✅ **Owner Check-ins**: Reset timeout mechanism to prove activity
- ✅ **Automatic Claims**: Beneficiaries can claim after timeout expires
- ✅ **Real Bitcoin Integration**: No simulations - actual Bitcoin testnet transactions

### Quick Test
1. **View Contract**: [Blockstream Explorer](https://blockstream.info/testnet/address/tb1qb55df1e19a57fa98938f2e776abd07ed)
2. **Fund Contract**: Send testnet Bitcoin to test functionality
3. **Use Application**: http://localhost:3000/app
4. **Connect Wallet**: Import address or use Unisat/Xverse

### Contract Verification
```bash
# Test vault state API
curl -X POST http://localhost:3000/api/charms/vault-state \
  -H "Content-Type: application/json" \
  -d '{"vaultId": "deployed-contract-tb1qb55df1e19a57fa98938f2e776abd07ed", "network": "testnet"}'

# Test spell execution
curl -X POST http://localhost:3000/api/charms/execute-spell \
  -H "Content-Type: application/json" \
  -d '{"spell": "...", "operation": "create-vault", "network": "testnet"}'
```

## 🔗 Links

- **Demo**: http://localhost:3000/app (after setup)
- **Live Contract**: [tb1qb55df1e19a57fa98938f2e776abd07ed](https://blockstream.info/testnet/address/tb1qb55df1e19a57fa98938f2e776abd07ed)
- **Charms Protocol**: [GitHub](https://github.com/CharmsDev/charms)
- **Bitcoin Testnet**: [Blockstream Explorer](https://blockstream.info/testnet/)
- **Unisat Wallet**: [Official Site](https://unisat.io)

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Secure your Bitcoin's future with Eternal Key 🚀**

*Built with ❤️ using Bitcoin, Charms Protocol, and React*