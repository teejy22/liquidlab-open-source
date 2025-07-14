// Hyperliquid API functions for spot trading

export const HYPERLIQUID_INFO_URL = 'https://api.hyperliquid.xyz/info';
export const HYPERLIQUID_API_URL = 'https://api.hyperliquid.xyz/exchange';

export async function fetchSpotMarkets() {
  try {
    const response = await fetch('/api/hyperliquid/spot-markets');
    if (!response.ok) throw new Error('Failed to fetch spot markets');
    return await response.json();
  } catch (error) {
    console.error('Error fetching spot markets:', error);
    return [];
  }
}

export async function fetchSpotAccountState(address: string) {
  try {
    const response = await fetch(`/api/hyperliquid/spot-account/${address}`);
    if (!response.ok) throw new Error('Failed to fetch spot account state');
    return await response.json();
  } catch (error) {
    console.error('Error fetching spot account state:', error);
    return null;
  }
}

export async function submitSpotTransfer(data: {
  address: string;
  amount: string;
  toPerp: boolean;
  nonce: number;
  signature: string;
}) {
  try {
    const response = await fetch('/api/hyperliquid/spot-transfer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Transfer failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting spot transfer:', error);
    throw error;
  }
}

export async function submitSpotOrder(data: {
  address: string;
  token: string;
  isBuy: boolean;
  amount: string;
  limitPrice: string | null;
  nonce: number;
  signature: string;
}) {
  try {
    const response = await fetch('/api/hyperliquid/spot-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Order failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting spot order:', error);
    throw error;
  }
}