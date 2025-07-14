import { ethers } from 'ethers';
import { HYPERLIQUID_INFO_URL, HYPERLIQUID_API_URL } from './hyperliquid-api';
import { signL1Action } from './hyperliquid-signing';

// Spot market info
export interface SpotMarket {
  token: string;
  name: string;
  index: number;
  markPrice: string;
  volume24h: string;
  change24h: string;
  baseDecimals: number;
  quoteDecimals: number;
}

// Spot balance info
export interface SpotBalance {
  token: string;
  balance: string;
  value: string; // USD value
}

// Account info for spot vs perp
export interface AccountBalances {
  perp: {
    usdc: string;
    totalValue: string;
  };
  spot: {
    usdc: string;
    totalValue: string;
    balances: SpotBalance[];
  };
}

// Get spot markets from Hyperliquid
export async function getSpotMarkets(): Promise<SpotMarket[]> {
  try {
    // Get spot metadata
    const spotMetaResponse = await fetch(`${HYPERLIQUID_INFO_URL}/spotMeta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'spotMeta' })
    });

    if (!spotMetaResponse.ok) {
      throw new Error('Failed to fetch spot metadata');
    }

    const spotMeta = await spotMetaResponse.json();
    
    // Get spot market data
    const marketsResponse = await fetch(`${HYPERLIQUID_INFO_URL}/spotClearinghouseState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'spotClearinghouseState' })
    });

    if (!marketsResponse.ok) {
      throw new Error('Failed to fetch spot markets');
    }

    const marketData = await marketsResponse.json();
    const markets: SpotMarket[] = [];

    // Map spot tokens to market data
    for (let i = 0; i < spotMeta.tokens.length; i++) {
      const token = spotMeta.tokens[i];
      const marketInfo = marketData.tokens[i];
      
      if (token.name && token.name !== 'USDC') { // Skip USDC as it's the quote currency
        markets.push({
          token: token.name,
          name: token.fullName || token.name,
          index: i,
          markPrice: marketInfo.markPx || '0',
          volume24h: marketInfo.dayNtlVlm || '0',
          change24h: marketInfo.prevDayPx ? 
            (((parseFloat(marketInfo.markPx) - parseFloat(marketInfo.prevDayPx)) / parseFloat(marketInfo.prevDayPx)) * 100).toFixed(2) : 
            '0',
          baseDecimals: token.szDecimals || 8,
          quoteDecimals: 8 // USDC has 8 decimals
        });
      }
    }

    return markets.sort((a, b) => parseFloat(b.volume24h) - parseFloat(a.volume24h));
  } catch (error) {
    console.error('Error fetching spot markets:', error);
    return [];
  }
}

// Get account balances for both perp and spot
export async function getAccountBalances(address: string): Promise<AccountBalances> {
  try {
    // Get perp account state
    const perpResponse = await fetch(`${HYPERLIQUID_INFO_URL}/clearinghouseState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'clearinghouseState',
        user: address
      })
    });

    const perpData = await perpResponse.json();
    
    // Get spot account state
    const spotResponse = await fetch(`${HYPERLIQUID_INFO_URL}/spotClearinghouseState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'spotClearinghouseState',
        user: address
      })
    });

    const spotData = await spotResponse.json();
    
    // Parse perp balances
    const perpUsdc = perpData.withdrawable || '0';
    const perpTotalValue = perpData.accountValue || '0';
    
    // Parse spot balances
    const spotBalances: SpotBalance[] = [];
    let spotUsdc = '0';
    let spotTotalValue = 0;
    
    if (spotData.balances) {
      for (const [token, balance] of Object.entries(spotData.balances)) {
        const bal = balance as any;
        const tokenBalance = bal.hold || '0';
        const tokenValue = parseFloat(tokenBalance) * parseFloat(bal.markPx || '0');
        
        if (token === 'USDC') {
          spotUsdc = tokenBalance;
          spotTotalValue += parseFloat(tokenBalance);
        } else if (parseFloat(tokenBalance) > 0) {
          spotBalances.push({
            token,
            balance: tokenBalance,
            value: tokenValue.toFixed(2)
          });
          spotTotalValue += tokenValue;
        }
      }
    }
    
    return {
      perp: {
        usdc: perpUsdc,
        totalValue: perpTotalValue
      },
      spot: {
        usdc: spotUsdc,
        totalValue: spotTotalValue.toFixed(2),
        balances: spotBalances
      }
    };
  } catch (error) {
    console.error('Error fetching account balances:', error);
    return {
      perp: { usdc: '0', totalValue: '0' },
      spot: { usdc: '0', totalValue: '0', balances: [] }
    };
  }
}

// Transfer USDC between perp and spot accounts
export async function transferUSDC(
  wallet: ethers.Signer,
  amount: string,
  fromPerp: boolean, // true = perp to spot, false = spot to perp
  nonce: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const address = await wallet.getAddress();
    const timestamp = Date.now();
    
    // Create transfer action
    const action = {
      type: fromPerp ? 'perpToSpot' : 'spotToPerp',
      user: address,
      amount: amount,
      nonce: nonce,
      time: timestamp
    };
    
    // Sign the transfer
    const signature = await signL1Action(wallet, action, timestamp);
    
    // Submit transfer
    const response = await fetch(`${HYPERLIQUID_API_URL}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        signature,
        nonce: timestamp
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'ok') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.response || 'Transfer failed' 
      };
    }
  } catch (error) {
    console.error('Transfer error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Place a spot order
export async function placeSpotOrder(
  wallet: ethers.Signer,
  token: string,
  isBuy: boolean,
  size: string,
  limitPrice: string | null, // null for market orders
  nonce: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const address = await wallet.getAddress();
    const timestamp = Date.now();
    
    // Create spot order action
    const action = {
      type: 'spotOrder',
      user: address,
      asset: token,
      isBuy: isBuy,
      sz: size,
      limitPx: limitPrice || null,
      orderType: limitPrice ? 'limit' : 'market',
      nonce: nonce,
      time: timestamp
    };
    
    // Sign the order
    const signature = await signL1Action(wallet, action, timestamp);
    
    // Submit order
    const response = await fetch(`${HYPERLIQUID_API_URL}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        signature,
        nonce: timestamp
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'ok') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.response || 'Order failed' 
      };
    }
  } catch (error) {
    console.error('Spot order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Get spot open orders
export async function getSpotOpenOrders(address: string): Promise<any[]> {
  try {
    const response = await fetch(`${HYPERLIQUID_INFO_URL}/openOrders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'openOrders',
        user: address
      })
    });
    
    const orders = await response.json();
    // Filter for spot orders (they don't have coin field, or have isSpot: true)
    return orders.filter((order: any) => order.isSpot || !order.coin);
  } catch (error) {
    console.error('Error fetching spot orders:', error);
    return [];
  }
}

// Cancel a spot order
export async function cancelSpotOrder(
  wallet: ethers.Signer,
  orderId: string,
  nonce: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const address = await wallet.getAddress();
    const timestamp = Date.now();
    
    const action = {
      type: 'cancelSpotOrder',
      user: address,
      oid: orderId,
      nonce: nonce,
      time: timestamp
    };
    
    const signature = await signL1Action(wallet, action, timestamp);
    
    const response = await fetch(`${HYPERLIQUID_API_URL}/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        signature,
        nonce: timestamp
      })
    });
    
    const result = await response.json();
    
    if (result.status === 'ok') {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: result.response || 'Cancel failed' 
      };
    }
  } catch (error) {
    console.error('Cancel spot order error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}