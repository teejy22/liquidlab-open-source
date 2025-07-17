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
  
  // Supported spot pairs
  const spotPairs = ["HYPE", "PUMP", "ETH", "BTC", "SOL", "FARTCOIN"];

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
      // For spot trading, we would need to implement the actual spot order flow
      // This would involve signing the order with the user's wallet
      const response = await fetch('/api/hyperliquid/spot-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedPair,
          side: orderSide,
          amount: amount,
          walletAddress: walletAddress
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
    <div className="space-y-4">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Spot Trading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Market Cards */}
          <div className="grid grid-cols-2 gap-2">
            {spotPairs.map((pair) => {
              const priceData = prices[pair];
              const isSelected = selectedPair === pair;
              
              return (
                <Card
                  key={pair}
                  onClick={() => setSelectedPair(pair)}
                  className={`cursor-pointer transition-all bg-gray-800 ${
                    isSelected 
                      ? 'border-green-500 border-2' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{pair}/USDC</div>
                      <div className="text-xs text-gray-400">
                        Vol: {priceData?.volume24h > 0 ? `$${(priceData.volume24h / 1000000).toFixed(1)}M` : '$0'}
                      </div>
                      <div className="text-lg font-medium">
                        ${priceData?.price ? priceData.price.toLocaleString(undefined, {
                          minimumFractionDigits: pair === "BTC" || pair === "ETH" ? 0 : 2,
                          maximumFractionDigits: pair === "BTC" || pair === "ETH" ? 0 : 4
                        }) : '0.00'}
                      </div>
                      <div className={`text-xs ${
                        (priceData?.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(priceData?.change24h || 0) >= 0 ? '+' : ''}{(priceData?.change24h || 0).toFixed(2)}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
                  <span className="font-medium">${calculateTotal()} USDC</span>
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