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
