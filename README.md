# Heritaz (Previously Eternal Key)

A Bitcoin inheritance vault that works automatically. Built with Charms Protocol.

## The Story

Picture this: Satoshi Nakamoto passes away. He's got millions in Bitcoin, maybe billions. His family knows he had it, but they can't access it. The private keys? Gone forever.

That's the thing about Bitcoin. There's no customer service line. No estate lawyer can call the bank and sort it out. If you die without passing on your keys, that wealth just... disappears.

This happens all the time. Not just to legendary crypto creators, but to regular people. Your Bitcoin can outlive you, but your family can't touch it.

Heritaz fixes this.

## What It Does

Think of it like a dead man's switch for your Bitcoin.

You set up a vault. Add your family members or whoever you want to inherit your Bitcoin. Set a timeout—maybe 6 months, maybe a year.

Then you just check in regularly. Click a button that says "hey, I'm still here."

If you stop checking in? The vault opens automatically. Your Bitcoin goes to the people you chose, split however you decided.

No lawyers. No passwords to remember. No secret notes hidden in safe deposit boxes.

Just code running on Bitcoin.

## How It Actually Works

**Create a vault.** Pick your beneficiaries and what percentage each person gets.

**Check in periodically.** This resets the timer. As long as you're checking in, nothing happens.

**Automatic transfer.** If the timeout expires, beneficiaries can claim their share.

The whole thing runs on Bitcoin testnet right now. It's real Bitcoin transactions, not a simulation. We're using Charms Protocol to make Bitcoin programmable.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000/app

You'll need a Bitcoin testnet wallet. Unisat works great. Switch it to testnet mode, connect it, and you're good.

Get free testnet Bitcoin from:
- Coinfaucet.eu  
- Mempool testnet faucet
- Any Bitcoin testnet faucet

## Architecture

### System Overview

Heritaz is built on a three-layer architecture that combines Bitcoin's security with smart contract programmability:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                         │
│  Next.js + React + Tailwind CSS + Wallet Integration       │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   API Layer (Next.js)                       │
│  • Vault State Query    • Execute Operations                │
│  • Vault Creation       • Owner Management                  │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│             Smart Contract Layer (Rust)                     │
│  Charms Protocol SDK on Bitcoin Testnet                    │
│  Contract Address: tb1qb55df1e19a57fa98938f2e776abd07ed   │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                  Bitcoin Testnet                            │
│  Immutable storage & validation of all vault operations    │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. **Smart Contract (`contracts/src/lib.rs`)**
The heart of Heritaz. Written in Rust using the Charms Protocol SDK.

**Key Functions:**
- **Vault Creation:** Validates beneficiaries, ensures percentages sum to 100%
- **Check-in:** Resets the timeout timer, requires owner signature
- **Claim:** Allows beneficiaries to claim funds after timeout expires
- **Token Management:** Tracks vault balance via NFT and TOKEN charms

**Validation Rules:**
- Timeout must be between 1 day and 10 years (in blocks)
- Beneficiary percentages must sum to exactly 100%
- Only owner can check in or modify vault
- Only beneficiaries can claim after timeout

#### 2. **Frontend (`components/` + `app/`)**

**Wallet Integration:**
- Supports multiple Bitcoin wallets: Unisat, Leather, Xverse, OKX
- Modal-based wallet selection with auto-detection
- Testnet-first configuration

**Core Components:**
- `bitcoinInheritanceVault.tsx` - Main vault interface
- `walletModal.tsx` - Multi-wallet connection modal
- `bitcoinWalletProvider.tsx` - Wallet state management

#### 3. **API Layer (`app/api/charms/`)**

**Endpoints:**
- `POST /api/charms/vault-state` - Query current vault state
- `POST /api/charms/execute-spell` - Execute vault operations
- `POST /api/charms/vaults-by-owner` - Get all vaults for an owner
- `GET /api/bitcoin/block-height` - Get current Bitcoin block height

### Data Flow

#### Creating a Vault:
```
User → Wallet Modal → Select Beneficiaries → API Call → 
Smart Contract Validation → Bitcoin Transaction → Vault Created
```

#### Check-in Process:
```
User → Connect Wallet → Click Check-in → Sign Transaction → 
Smart Contract Updates last_checkin → Timer Resets
```

#### Claiming Inheritance:
```
Beneficiary → Wait for Timeout → Connect Wallet → Claim → 
Smart Contract Validates Timeout → Funds Distributed
```

### Smart Contract Data Structure

```rust
pub struct InheritanceVault {
    pub owner: String,              // Bitcoin address of vault owner
    pub beneficiaries: Vec<Beneficiary>,  // List of inheritors
    pub timeout_blocks: u32,        // Blocks until vault unlocks
    pub last_checkin: u32,          // Last check-in block height
    pub vault_balance: u64,         // Balance in satoshis
    pub status: VaultStatus,        // Active, Locked, Claiming, Claimed
    pub vault_id: String,           // Unique vault identifier
    pub created_at: u64,            // Creation timestamp
}

pub struct Beneficiary {
    pub address: String,     // Bitcoin address
    pub percentage: u8,      // Share (0-100)
    pub name: String,        // Display name
}
```

### Security Model

**On-Chain Validation:**
- All vault operations are validated by the smart contract
- Owner signatures required for check-ins and modifications
- Beneficiary signatures required for claims
- Timeout verification ensures funds can't be claimed early

**Wallet Security:**
- Private keys never leave the browser wallet extension
- All transactions signed client-side
- No server-side key storage

**Testnet Safety:**
- Currently runs only on Bitcoin testnet
- No real funds at risk during testing phase

### Technology Stack

**Smart Contract Layer:**
- **Language:** Rust
- **Framework:** Charms Protocol SDK
- **Blockchain:** Bitcoin Testnet
- **Contract Type:** NFT + TOKEN charms

**Backend:**
- **Framework:** Next.js 16 (App Router)
- **Runtime:** Node.js
- **API:** RESTful endpoints

**Frontend:**
- **Framework:** React 18
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Wallet:** Unisat, Leather, Xverse, OKX support

**Deployment:**
- **Network:** Bitcoin Testnet
- **Contract Address:** `tb1qb55df1e19a57fa98938f2e776abd07ed`
- **Frontend:** Vercel-ready

### Block Time & Timeouts

Bitcoin produces blocks approximately every 10 minutes:
- **1 day** = 144 blocks
- **1 week** = 1,008 blocks
- **1 month** = ~4,320 blocks
- **6 months** = ~26,280 blocks
- **1 year** = ~52,560 blocks

Heritaz allows timeout periods from 144 blocks (1 day) to 5,256,000 blocks (~10 years).

---

## The Tech

**Backend:** Rust smart contract using Charms Protocol SDK  
**Frontend:** React and Next.js  
**Network:** Bitcoin testnet

The contract address is already deployed: `tb1qb55df1e19a57fa98938f2e776abd07ed`

You can test it right now. No setup needed beyond running the dev server.

## Testing It Out

```bash
# Check vault state
curl -X POST http://localhost:3000/api/charms/vault-state \
  -H "Content-Type: application/json" \
  -d '{"vaultId": "test-vault", "network": "testnet"}'
```

Or just use the UI. It's easier.

## What's Next

Right now this works on Bitcoin testnet. That's intentional—we're testing, not risking real money.

Eventually we want to add multi-signature support, better security, and mainnet deployment. But for now, this proves the concept works.

## Important Stuff

This is testnet only. Don't use it with real Bitcoin yet.

Private keys in this demo are stored in plain text. That's fine for testing, terrible for production.

You need a browser wallet extension like Unisat or Xverse.

## Why This Matters

Billions of dollars in crypto have been lost because someone died without sharing their keys.

Your bank account gets handled by your will. Your house goes through probate. But Bitcoin? It just sits there, locked forever.

Until now, the only solution was to literally write down your seed phrase and hope your family finds it. Or put it in a safety deposit box and hope they know to look there.

This is better. It's automatic. It's trustless. It's just code.

## Development Progress

### Current Status
Bitcoin inheritance vault on testnet using Charms Protocol. Core functionality working: vault creation, check-ins, automatic transfers.

### What's Next
**Security & Production Readiness**
- Implement proper key management (replace plain text storage)
- Add multi-signature support for family members
- Security audit and rate limiting

**UX/UI Improvements**
- Better wallet connection and error handling
- Mobile responsive design
- Email/SMS notifications for check-in deadlines

**Core Features**
- Emergency recovery options
- Partial withdrawals while keeping vault active
- Vault templates for common inheritance scenarios

*See [roadmap/next-steps.md](/roadmap/next-steps.md) for complete development roadmap.*

## License

MIT. Use it however you want.

---

Built with Bitcoin, Charms Protocol, and the hope that no one loses their crypto fortune because they forgot to plan ahead.
