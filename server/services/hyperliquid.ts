export class HyperliquidService {
  private readonly baseUrl = "https://api.hyperliquid.xyz";

  async getMarketData(symbol?: string) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "allMids",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (symbol) {
        return data[symbol] || null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching market data:", error);
      throw error;
    }
  }

  async getOrderbook(symbol: string) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "l2Book",
          coin: symbol,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching orderbook:", error);
      throw error;
    }
  }

  async getUserState(address: string) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "userState",
          user: address,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user state:", error);
      throw error;
    }
  }

  async placeOrder(userAddress: string, order: any) {
    try {
      const response = await fetch(`${this.baseUrl}/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: {
            type: "order",
            orders: [order],
          },
          nonce: Date.now(),
          signature: "", // This would need to be properly signed
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }

  async getCandleData(symbol: string, interval: string = "1m", startTime?: number, endTime?: number) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "candleSnapshot",
          req: {
            coin: symbol,
            interval,
            startTime,
            endTime,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching candle data:", error);
      throw error;
    }
  }

  async getMetaAndAssetCtxs() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "metaAndAssetCtxs",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching meta and asset contexts:", error);
      throw error;
    }
  }
}
