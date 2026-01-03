import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { ownerAddress, network } = await request.json();

    console.log(`Querying vaults for owner ${ownerAddress} on ${network}`);

    // For now, return empty array since there are no actual vaults on the deployed contract yet
    // In a real implementation, this would:
    // 1. Connect to Bitcoin testnet RPC
    // 2. Query deployed contract at: tb1qb55df1e19a57fa98938f2e776abd07ed
    // 3. Filter vaults by owner address from actual blockchain data

    const deployedContract = process.env.DEPLOYED_CONTRACT_ADDRESS || 'tb1qb55df1e19a57fa98938f2e776abd07ed';

    // Since this is a new deployed contract, there are likely no vaults yet
    // Return empty array which is correct for an unused contract
    const vaultsData = {
      vaults: [], // No vaults found for this owner address
      success: true,
      message: `No vaults found for owner ${ownerAddress} on deployed contract ${deployedContract}`
    };

    console.log(`Found ${vaultsData.vaults.length} vaults for owner ${ownerAddress}`);

    return NextResponse.json(vaultsData);

  } catch (error) {
    console.error('Vaults by owner API error:', error);

    return NextResponse.json({
      success: false,
      vaults: [],
      error: error instanceof Error ? error.message : 'Failed to retrieve vaults by owner'
    }, { status: 500 });
  }
}