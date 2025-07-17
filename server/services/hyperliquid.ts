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

  async placeOrder(orderRequest: any) {
    try {
      const response = await fetch(`${this.baseUrl}/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Hyperliquid error response:", errorText);
        throw new Error(`Order failed: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  }

  async getUserPositions(address: string) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "clearinghouseState",
          user: address,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user positions:", error);
      throw error;
    }
  }

  async getRecentTradesForBuilder(builderCode: string, startTime?: number) {
    try {
      // Hyperliquid API doesn't have a direct endpoint for builder code trades
      // We'll need to fetch all recent trades and filter by builder code
      // This is a simplified approach - in production, you might need WebSocket or more efficient methods
      
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "recentTrades",
          coin: "BTC", // We'll need to fetch for all coins
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const trades = await response.json();
      
      // Filter trades by builder code if they contain that information
      // Note: This is a placeholder - actual implementation depends on Hyperliquid's API structure
      return trades.filter((trade: any) => 
        trade.builderCode === builderCode && 
        (!startTime || trade.time > startTime)
      );
    } catch (error) {
      console.error("Error fetching builder trades:", error);
      throw error;
    }
  }

  async getUserFills(address: string, startTime?: number) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "userFills",
          user: address,
          startTime: startTime || 0,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user fills:", error);
      throw error;
    }
  }

  async getUserTradesWithCode(address: string, builderCode: string, startTime?: number) {
    try {
      // Fetch user's recent fills/trades
      const fills = await this.getUserFills(address, startTime);
      
      // Filter by builder code if the field exists
      // Note: The actual field name depends on Hyperliquid's API response structure
      return fills.filter((fill: any) => 
        fill.builderCode === builderCode || 
        fill.cloid?.includes(builderCode) ||
        fill.oid?.includes(builderCode)
      );
    } catch (error) {
      console.error("Error fetching user trades with code:", error);
      throw error;
    }
  }

  async getUserOpenOrders(address: string) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "openOrders",
          user: address,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching open orders:", error);
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

  async getSpotMeta() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "spotMeta",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching spot meta:", error);
      throw error;
    }
  }

  async getSpotMetaAndAssetCtxs() {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "spotMetaAndAssetCtxs",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching spot meta and asset contexts:", error);
      throw error;
    }
  }

  async getSpotClearinghouseState(userAddress: string) {
    try {
      const response = await fetch(`${this.baseUrl}/info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "spotClearinghouseState",
          user: userAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching spot clearinghouse state:", error);
      throw error;
    }
  }
}
