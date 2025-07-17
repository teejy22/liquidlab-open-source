import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

interface SpotPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export function SimpleSpotTrading({ walletAddress }: { walletAddress?: string }) {
  const { authenticated } = usePrivy();
  const { toast } = useToast();
  
  const [prices, setPrices] = useState<Record<string, SpotPrice>>({});
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  const [selectedPair, setSelectedPair] = useState("HYPE");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  
  // All requested tokens with availability status
  const tokenInfo = [
    { symbol: "BTC", available: true, actualSymbol: "UBTC" },
    { symbol: "ETH", available: true, actualSymbol: "UETH" },
    { symbol: "SOL", available: true, actualSymbol: "USOL" },
    { symbol: "FARTCOIN", available: false },
    { symbol: "PUMP", available: true },
    { symbol: "HYPE", available: true }
  ];

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (authenticated && walletAddress) {
      fetchBalances();
    }
  }, [authenticated, walletAddress]);

  const fetchPrices = async () => {
    try {
      const response = await fetch('/api/hyperliquid/spot-prices');
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const data = await response.json();
      setPrices(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching spot prices:', error);
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    if (!walletAddress) return;
    
    try {
      const response = await fetch(`/api/hyperliquid/balances/${walletAddress}`);
      if (!response.ok) throw new Error('Failed to fetch balances');
      
      const data = await response.json();
      
      // Extract spot balances
      const spotBalances: Record<string, string> = {};
      if (data.balances) {
        data.balances.forEach((balance: any) => {
          spotBalances[balance.coin] = balance.total || "0";
        });
      }
      
      setBalances(spotBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const handleTrade = async () => {
    if (!authenticated || !walletAddress) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to trade",
        variant: "destructive"
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setPlacingOrder(true);
    
    try {
      // Find the actual symbol to use for trading
      const tokenData = tokenInfo.find(t => t.symbol === selectedPair);
      const actualSymbol = tokenData?.actualSymbol || selectedPair;
      
      const response = await fetch('/api/hyperliquid/spot-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: actualSymbol,  // Use the actual trading symbol (UBTC, UETH, USOL)
          displaySymbol: selectedPair,  // Display symbol for UI feedback
          side: orderSide,
          amount: amount,
          // IMPORTANT: Lowercase the wallet address to avoid signature recovery issues
          walletAddress: walletAddress.toLowerCase()
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Order Submitted",
          description: `${orderSide.toUpperCase()} ${amount} ${selectedPair} order placed`,
        });
        setAmount("");
        fetchBalances(); // Refresh balances
      } else {
        throw new Error(result.error || 'Failed to place order');
      }
    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message || "Failed to place spot order",
        variant: "destructive"
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const calculateTotal = () => {
    const price = prices[selectedPair]?.price || 0;
    const qty = parseFloat(amount) || 0;
    return (price * qty).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm font-semibold text-white">Spot Trading</CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          {/* Market List - Compact single column */}
          <div className="space-y-1.5 max-h-[300px] overflow-y-auto custom-scrollbar">
            {tokenInfo.map((token) => {
              const priceData = prices[token.symbol];
              const isSelected = selectedPair === token.symbol;
              const isAvailable = token.available && priceData;
              
              return (
                <div
                  key={token.symbol}
                  onClick={() => isAvailable && setSelectedPair(token.symbol)}
                  className={`flex items-center justify-between p-2 rounded transition-all ${
                    isAvailable 
                      ? `cursor-pointer ${isSelected ? 'bg-gray-700 border border-green-500' : 'bg-gray-800 hover:bg-gray-750'}`
                      : 'bg-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-xs text-white flex items-center gap-1">
                        {token.symbol}/USDC
                        {!isAvailable && (
                          <span className="text-[9px] text-yellow-400 bg-yellow-900/30 px-1 rounded">
                            Soon
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {isAvailable && priceData?.volume24h > 0 
                          ? `Vol: $${priceData.volume24h < 1000 
                            ? priceData.volume24h.toFixed(0)
                            : (priceData.volume24h / 1000000).toFixed(1) + 'M'}`
                          : 'Vol: --'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {isAvailable && priceData?.price ? (
                        // Display prices directly from API without conversion
                        `$${priceData.price >= 1000 
                          ? priceData.price.toFixed(0) 
                          : priceData.price >= 1 
                          ? priceData.price.toFixed(2)
                          : priceData.price >= 0.01
                          ? priceData.price.toFixed(4)
                          : priceData.price.toFixed(6)}`
                      ) : '--'}
                    </div>
                    <div className={`text-[10px] ${
                      isAvailable 
                        ? (priceData?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                        : 'text-gray-500'
                    }`}>
                      {isAvailable && priceData?.change24h !== undefined
                        ? `${priceData.change24h >= 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%`
                        : '--'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trading Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 space-y-3">
              {/* Buy/Sell Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setOrderSide("buy")}
                  className={`h-10 ${
                    orderSide === "buy"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  Buy {selectedPair}
                </Button>
                <Button
                  onClick={() => setOrderSide("sell")}
                  className={`h-10 ${
                    orderSide === "sell"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-300"
                  }`}
                >
                  Sell {selectedPair}
                </Button>
              </div>

              {/* Balance Display */}
              {authenticated && (
                <div className="text-xs text-gray-400">
                  Available: {balances[orderSide === "buy" ? "USDC" : selectedPair] || "0"} {orderSide === "buy" ? "USDC" : selectedPair}
                </div>
              )}

              {/* Amount Input */}
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Amount</span>
                  <span>{selectedPair}</span>
                </div>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>

              {/* Total Display */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total</span>
                  <span className="font-medium text-white">${calculateTotal()} USDC</span>
                </div>
              </div>

              {/* Trade Button */}
              <Button
                onClick={handleTrade}
                disabled={!authenticated || placingOrder}
                className={`w-full h-10 font-medium ${
                  orderSide === "buy"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } text-white disabled:opacity-50`}
              >
                {placingOrder ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : authenticated ? (
                  `${orderSide.toUpperCase()} ${selectedPair}`
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-3">
              <div className="text-xs text-gray-400 space-y-1">
                <p>• Spot trading on Hyperliquid DEX</p>
                <p>• No leverage, direct token swaps</p>
                <p>• 0.2% trading fee on all spot trades</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}