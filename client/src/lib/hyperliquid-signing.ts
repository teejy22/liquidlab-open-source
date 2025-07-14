import { ethers } from 'ethers';

// Hyperliquid EIP-712 Domain
const HYPERLIQUID_DOMAIN = {
  name: 'Exchange',
  version: '1',
  chainId: 42161, // Arbitrum mainnet
  verifyingContract: '0x0000000000000000000000000000000000000000' // Hyperliquid doesn't use a verifying contract
};

// EIP-712 Types for Hyperliquid Orders
const ORDER_TYPES = {
  Order: [
    { name: 'asset', type: 'uint32' },
    { name: 'isBuy', type: 'bool' },
    { name: 'limitPx', type: 'uint64' },
    { name: 'sz', type: 'uint64' },
    { name: 'nonce', type: 'uint64' },
    { name: 'tif', type: 'uint8' }
  ]
};

// Time in Force options
export enum TimeInForce {
  ALO = 0, // Add Liquidity Only (Post Only)
  IOC = 1, // Immediate or Cancel
  GTC = 2, // Good Till Cancel
  GTD = 3  // Good Till Date (not commonly used)
}

// Convert price and size to Hyperliquid's internal format
function floatToWire(x: number, decimals: number): string {
  const rounded = Math.round(x * Math.pow(10, decimals));
  return rounded.toString();
}

// Get asset index from symbol
function getAssetIndex(symbol: string): number {
  // This would need to be fetched from Hyperliquid's meta endpoint
  // For now, using common indices
  const assetMap: { [key: string]: number } = {
    'BTC': 0,
    'ETH': 1,
    'BNB': 2,
    'XRP': 3,
    'SOL': 4,
    'DOGE': 5,
    'MATIC': 6,
    'LTC': 7,
    'SHIB': 8,
    'AVAX': 9,
    'LINK': 10,
    'ATOM': 11,
    'UNI': 12,
    'ETC': 13,
    'TON': 14,
    'XLM': 15,
    'INJ': 16,
    'HBAR': 17,
    'ICP': 18,
    'TRX': 19,
    'APT': 20,
    'FIL': 21,
    'ARB': 22,
    'STX': 23,
    'NEAR': 24,
    'RENDER': 25,
    'IMX': 26,
    'OP': 27,
    'MNT': 28,
    'TIA': 29,
    'SEI': 30,
    'SUI': 31,
    'ZETA': 32,
    'MEME': 33,
    'TAO': 34,
    'FET': 35,
    'RNDR': 36,
    'WIF': 37,
    'BONK': 38,
    'PEPE': 39,
    'PYTH': 40,
    'JUP': 41,
    'STRK': 42,
    'DYM': 43,
    'ALT': 44,
    'MANTA': 45,
    'PIXEL': 46,
    'WLD': 47,
    'PENDLE': 48,
    'AEVO': 49,
    'BOME': 50,
    'ETHFI': 51,
    'ENA': 52,
    'W': 53,
    'TNSR': 54,
    'SAGA': 55,
    'OMNI': 57,
    'MERL': 58,
    'REZ': 59,
    'BB': 60,
    'NOT': 61,
    'IO': 62,
    'ZK': 63,
    'LISTA': 64,
    'ZRO': 65,
    'BLAST': 66,
    'BANANA': 67,
    'AAVE': 68,
    'POPCAT': 69,
    'G': 70,
    'SWELL': 71,
    'HMSTR': 72,
    'EIGEN': 73,
    'LUMIA': 74,
    'SCR': 75,
    'GOAT': 76,
    'MOODENG': 77,
    'PNUT': 78,
    'ACT': 79,
    'GRASS': 80,
    'CETUS': 81,
    'MORPHO': 82,
    'SPX': 83,
    'VIRTUAL': 84,
    'HYPE': 85,
    'ME': 86,
    'MOVE': 87,
    'SUPRA': 88,
    'ORCA': 89,
    'FARTCOIN': 90,
    'PENGU': 91,
    'VANA': 92,
    'CGPT': 93,
    'AVA': 94,
    'AIXBT': 95,
    'SWARMS': 96,
    'COOKIE': 97,
    'ZEREBRO': 98,
    'BIO': 99,
    'GRIFFAIN': 100,
    'AI16Z': 101,
    'USUAL': 102,
    'DINO': 103
  };
  
  return assetMap[symbol] ?? 0;
}

export interface HyperliquidOrder {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  size: number;
  orderType: 'limit' | 'market';
  reduceOnly?: boolean;
  postOnly?: boolean;
  ioc?: boolean;
}

export interface SignedOrder {
  order: any;
  signature: string;
  nonce: number;
}

export async function signOrder(
  order: HyperliquidOrder,
  signer: any // Privy's embedded wallet signer
): Promise<SignedOrder> {
  const nonce = Date.now();
  const assetIndex = getAssetIndex(order.symbol);
  
  // Determine time in force
  let tif = TimeInForce.GTC;
  if (order.postOnly) {
    tif = TimeInForce.ALO;
  } else if (order.ioc || order.orderType === 'market') {
    tif = TimeInForce.IOC;
  }
  
  // For market orders, use a very high/low price
  const limitPrice = order.orderType === 'market' 
    ? (order.side === 'buy' ? 1e9 : 0.0001)
    : order.price;
  
  // Convert to wire format (Hyperliquid uses 8 decimals for price, 5 for size on perps)
  const wireLimitPx = floatToWire(limitPrice, 8);
  const wireSz = floatToWire(order.size, 5);
  
  // Create the order object for signing
  const orderData = {
    asset: assetIndex,
    isBuy: order.side === 'buy',
    limitPx: wireLimitPx,
    sz: wireSz,
    nonce: nonce,
    tif: tif
  };
  
  // Create the typed data for EIP-712 signing
  const typedData = {
    types: ORDER_TYPES,
    domain: HYPERLIQUID_DOMAIN,
    primaryType: 'Order',
    message: orderData
  };
  
  // Sign the order using Privy's signer
  const signature = await signer._signTypedData(
    typedData.domain,
    typedData.types,
    orderData
  );
  
  // Create the final order format for Hyperliquid API
  const hyperliquidOrder = {
    a: assetIndex,
    b: order.side === 'buy',
    p: wireLimitPx,
    s: wireSz,
    r: order.reduceOnly || false,
    t: {
      limit: {
        tif: tif === TimeInForce.ALO ? 'Alo' : tif === TimeInForce.IOC ? 'Ioc' : 'Gtc'
      }
    },
    c: 'LIQUIDLAB2025' // Automatically include the builder code
  };
  
  return {
    order: hyperliquidOrder,
    signature,
    nonce
  };
}

// Helper function to format order for API submission
export function formatOrderRequest(
  userAddress: string,
  signedOrders: SignedOrder[]
): any {
  return {
    action: {
      type: 'order',
      orders: signedOrders.map(so => so.order),
      grouping: 'na'
    },
    nonce: signedOrders[0].nonce,
    signature: signedOrders[0].signature
  };
}