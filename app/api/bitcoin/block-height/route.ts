import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In production, this would query a Bitcoin testnet node or reliable API
    // For this demo, we'll calculate current testnet block height

    const testnetStartBlock = 2800000; // approximate testnet block as of Jan 2024
    const blocksPerDay = 144; // 10 min average block time
    const daysSinceStart = Math.floor(
      (Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)
    );

    const estimatedHeight = testnetStartBlock + (blocksPerDay * daysSinceStart);

    // Optionally, try to get real data from a public API (commented for reliability)
    // try {
    //   const response = await fetch('https://blockstream.info/testnet/api/blocks/tip/height');
    //   if (response.ok) {
    //     const realHeight = await response.json();
    //     return NextResponse.json({
    //       blockHeight: realHeight,
    //       network: 'Bitcoin Testnet',
    //       source: 'live'
    //     });
    //   }
    // } catch (error) {
    //   console.log('Fallback to estimated height');
    // }

    return NextResponse.json({
      blockHeight: estimatedHeight,
      network: 'Bitcoin Testnet',
      source: 'estimated',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Block height API error:', error);

    return NextResponse.json({
      blockHeight: 2800000, // fallback
      network: 'Bitcoin Testnet',
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}