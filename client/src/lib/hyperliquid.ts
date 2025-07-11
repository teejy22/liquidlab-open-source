import { MarketData, OrderbookData } from "@/types";

export class HyperliquidAPI {
  private baseUrl = '/api/hyperliquid';

  async getMarketData(symbol?: string): Promise<MarketData[]> {
    const response = await fetch(`${this.baseUrl}/market-data${symbol ? `?symbol=${symbol}` : ''}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    return response.json();
  }

  async getOrderbook(symbol: string): Promise<OrderbookData> {
    const response = await fetch(`${this.baseUrl}/orderbook/${symbol}`);
    if (!response.ok) {
      throw new Error('Failed to fetch orderbook');
    }
    return response.json();
  }

  async placeOrder(userAddress: string, order: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/place-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userAddress,
        order,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to place order');
    }
    return response.json();
  }

  async getCandleData(symbol: string, interval: string = '1m'): Promise<any> {
    const response = await fetch(`${this.baseUrl}/candles/${symbol}?interval=${interval}`);
    if (!response.ok) {
      throw new Error('Failed to fetch candle data');
    }
    return response.json();
  }
}

export const hyperliquidAPI = new HyperliquidAPI();
