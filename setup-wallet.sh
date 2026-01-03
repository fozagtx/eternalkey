#!/bin/bash

# EternalKey Testnet Wallet Setup Script
# This script sets up a Bitcoin testnet wallet for testing inheritance vaults

echo "🪙 EternalKey - Bitcoin Testnet Wallet Setup"
echo "==========================================="
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the development server is running
echo "🔍 Checking if EternalKey development server is running..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  EternalKey development server is not running."
    echo "   Please start it first by running: npm run dev"
    echo ""
    echo "   In a separate terminal window, run:"
    echo "   cd /home/devpima/Desktop/ek/eternalkey"
    echo "   npm run dev"
    echo ""
    read -p "Press Enter when the server is running, or Ctrl+C to exit..."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run the wallet setup script
echo "🚀 Running wallet setup..."
node scripts/setup-testnet-wallet.js

echo ""
echo "📖 Quick Start Guide:"
echo "   1. Copy the generated address"
echo "   2. Visit a testnet faucet and paste the address"
echo "   3. Wait for confirmation (10-60 minutes)"
echo "   4. Open http://localhost:3000/app"
echo "   5. Connect your wallet (Unisat recommended)"
echo "   6. Test the inheritance vault functionality"
echo ""
echo "✨ Happy testing with EternalKey!"