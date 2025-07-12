import { useState, useEffect } from "react";
import TradingViewWidget from "@/components/charts/tradingview-widget";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, DollarSign, Activity, ArrowUp, ArrowDown } from "lucide-react";

const tradingPairs = [
  { symbol: "BTCUSDT", name: "Bitcoin/USDT", exchange: "BINANCE" },
  { symbol: "ETHUSDT", name: "Ethereum/USDT", exchange: "BINANCE" },
  { symbol: "BNBUSDT", name: "BNB/USDT", exchange: "BINANCE" },
  { symbol: "SOLUSDT", name: "Solana/USDT", exchange: "BINANCE" },
  { symbol: "ADAUSDT", name: "Cardano/USDT", exchange: "BINANCE" },
  { symbol: "XRPUSDT", name: "XRP/USDT", exchange: "BINANCE" },
  { symbol: "DOTUSDT", name: "Polkadot/USDT", exchange: "BINANCE" },
  { symbol: "AVAXUSDT", name: "Avalanche/USDT", exchange: "BINANCE" },
];

interface MarketData {
  price: string;
  change24h: string;
  high24h: string;
  low24h: string;
  volume24h: string;
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 1) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  } else {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
}

export default function Example() {
  const [selectedPair, setSelectedPair] = useState(tradingPairs[0]);
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [chartInterval, setChartInterval] = useState("60");
  const [marketStats, setMarketStats] = useState<MarketData>({
    price: "0.00",
    change24h: "0.00%",
    high24h: "0.00",
    low24h: "0.00",
    volume24h: "0",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch live price data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Map symbols to CoinGecko IDs
        const coinMap: { [key: string]: string } = {
          "BTCUSDT": "bitcoin",
          "ETHUSDT": "ethereum",
          "BNBUSDT": "binancecoin",
          "SOLUSDT": "solana",
          "ADAUSDT": "cardano",
          "XRPUSDT": "ripple",
          "DOTUSDT": "polkadot",
          "AVAXUSDT": "avalanche-2"
        };

        const coinId = coinMap[selectedPair.symbol] || "bitcoin";
        
        // Using CoinGecko API (free tier)
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
        );
        
        const data = await response.json();
        const coinData = data[coinId];
        
        if (coinData) {
          const price = coinData.usd;
          const change24h = coinData.usd_24h_change?.toFixed(2) || "0.00";
          const volume = coinData.usd_24h_vol;
          
          setMarketStats({
            price: formatPrice(price),
            change24h: `${parseFloat(change24h) > 0 ? '+' : ''}${change24h}%`,
            high24h: formatPrice(price * 1.02), // Estimate
            low24h: formatPrice(price * 0.98), // Estimate
            volume24h: volume > 1000000000 ? `${(volume / 1000000000).toFixed(1)}B` : 
                      volume > 1000000 ? `${(volume / 1000000).toFixed(1)}M` : 
                      volume.toFixed(0).toLocaleString(),
          });
          setLastUpdated(new Date());
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching market data:", error);
        setIsLoading(false);
      }
    };

    fetchMarketData();
    // Update every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedPair]);

  // Mock order book data
  const orderBook = {
    bids: [
      { price: "43,565.00", amount: "0.2543", total: "11,078.59" },
      { price: "43,564.50", amount: "0.1832", total: "7,981.01" },
      { price: "43,564.00", amount: "0.5000", total: "21,782.00" },
      { price: "43,563.50", amount: "0.3211", total: "13,988.56" },
      { price: "43,563.00", amount: "0.1500", total: "6,534.45" },
    ],
    asks: [
      { price: "43,567.50", amount: "0.1800", total: "7,842.15" },
      { price: "43,568.00", amount: "0.2500", total: "10,892.00" },
      { price: "43,568.50", amount: "0.4123", total: "17,971.19" },
      { price: "43,569.00", amount: "0.3000", total: "13,070.70" },
      { price: "43,569.50", amount: "0.2100", total: "9,149.60" },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MarketBeat-style Header */}
      <header className="bg-[#003366] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">MarketBeat Trading</h1>
              <span className="text-sm text-gray-300">Powered by LiquidLab</span>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6">
                <a href="#" className="hover:text-gray-300 transition-colors">Markets</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Portfolio</a>
                <a href="#" className="hover:text-gray-300 transition-colors">Research</a>
                <a href="#" className="hover:text-gray-300 transition-colors">News</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Trading Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Asset Selector and Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-4">
            <div className="w-full lg:w-auto">
              <Select
                value={selectedPair.symbol}
                onValueChange={(value) => {
                  const pair = tradingPairs.find(p => p.symbol === value);
                  if (pair) setSelectedPair(pair);
                }}
              >
                <SelectTrigger className="w-full sm:w-[250px] h-12 text-lg font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tradingPairs.map((pair) => (
                    <SelectItem key={pair.symbol} value={pair.symbol}>
                      {pair.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Market Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
              <div>
                <p className="text-sm text-gray-500 flex items-center">
                  Price
                  {!isLoading && (
                    <span className="ml-2 flex items-center text-xs text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></span>
                      Live
                    </span>
                  )}
                </p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-2xl font-bold">${marketStats.price}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Change</p>
                {isLoading ? (
                  <div className="h-7 w-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className={`text-xl font-semibold ${marketStats.change24h.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {marketStats.change24h}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">24h Volume</p>
                {isLoading ? (
                  <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-lg font-medium">${marketStats.volume24h}</p>
                )}
              </div>
              {lastUpdated && !isLoading && (
                <div className="text-right sm:text-left">
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-600">
                    {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Trading Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chart Section - Takes up 3 columns */}
          <div className="lg:col-span-3">
            <Card className="p-4 sm:p-6">
              {/* Timeframe Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold">Live Chart</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={chartInterval === "1" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("1")}
                  >
                    1m
                  </Button>
                  <Button
                    variant={chartInterval === "5" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("5")}
                  >
                    5m
                  </Button>
                  <Button
                    variant={chartInterval === "15" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("15")}
                  >
                    15m
                  </Button>
                  <Button
                    variant={chartInterval === "60" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("60")}
                  >
                    1h
                  </Button>
                  <Button
                    variant={chartInterval === "240" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("240")}
                  >
                    4h
                  </Button>
                  <Button
                    variant={chartInterval === "D" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("D")}
                  >
                    1D
                  </Button>
                  <Button
                    variant={chartInterval === "W" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartInterval("W")}
                  >
                    1W
                  </Button>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="h-[550px] overflow-hidden rounded-lg border">
                <TradingViewWidget
                  symbol={`${selectedPair.exchange}:${selectedPair.symbol}`}
                  interval={chartInterval}
                  theme="light"
                  height={550}
                  className="w-full"
                />
              </div>
            </Card>
          </div>

          {/* Trading Panel - Takes up 1 column */}
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg font-semibold mb-6">Place Order</h3>
              
              <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "buy" | "sell")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
                    Buy
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    Sell
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={orderType} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Price (USDT)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Amount ({selectedPair.symbol.replace('USDT', '')})
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="pt-2 pb-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Total</span>
                      <span className="font-medium">
                        {price && amount ? `$${(parseFloat(price) * parseFloat(amount)).toFixed(2)}` : '$0.00'} USDT
                      </span>
                    </div>
                  </div>

                  <Button 
                    className={`w-full h-12 text-lg font-semibold ${
                      orderType === 'buy' 
                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} {selectedPair.symbol.replace('USDT', '')}
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Quick Stats */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Market Info</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">24h High</span>
                  {isLoading ? (
                    <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <span className="font-medium">${marketStats.high24h}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">24h Low</span>
                  {isLoading ? (
                    <div className="h-5 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <span className="font-medium">${marketStats.low24h}</span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Position Details Section */}
        <div className="mt-10">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Open Positions</h3>
              <Button variant="outline" size="sm">Close All</Button>
            </div>
            
            {/* Position Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total Collateral</p>
                <p className="text-lg font-semibold">$5,432.10</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Unrealized PnL</p>
                <p className="text-lg font-semibold text-green-600">+$234.56</p>
                <p className="text-xs text-green-600">+4.32%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Margin Ratio</p>
                <p className="text-lg font-semibold">15.8%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '15.8%' }}></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Free Collateral</p>
                <p className="text-lg font-semibold">$4,567.89</p>
              </div>
            </div>

            {/* Positions Table - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Symbol</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Side</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Size</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Entry</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Mark</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Liq. Price</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">PnL</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <span className="font-medium">BTC-USD</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">10x</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-green-600 font-medium">Long</span>
                    </td>
                    <td className="py-3 px-2 text-right">0.1234</td>
                    <td className="py-3 px-2 text-right">$43,125.00</td>
                    <td className="py-3 px-2 text-right">$43,567.89</td>
                    <td className="py-3 px-2 text-right text-red-600">$38,450.00</td>
                    <td className="py-3 px-2 text-right">
                      <div className="text-green-600">
                        <p className="font-medium">+$54.67</p>
                        <p className="text-xs">+1.02%</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Close
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <span className="font-medium">ETH-USD</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">5x</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-red-600 font-medium">Short</span>
                    </td>
                    <td className="py-3 px-2 text-right">2.5000</td>
                    <td className="py-3 px-2 text-right">$2,245.50</td>
                    <td className="py-3 px-2 text-right">$2,198.75</td>
                    <td className="py-3 px-2 text-right text-red-600">$2,450.00</td>
                    <td className="py-3 px-2 text-right">
                      <div className="text-green-600">
                        <p className="font-medium">+$116.88</p>
                        <p className="text-xs">+2.08%</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Close
                      </Button>
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <span className="font-medium">SOL-USD</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">3x</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-green-600 font-medium">Long</span>
                    </td>
                    <td className="py-3 px-2 text-right">50.0000</td>
                    <td className="py-3 px-2 text-right">$98.75</td>
                    <td className="py-3 px-2 text-right">$101.23</td>
                    <td className="py-3 px-2 text-right text-red-600">$82.50</td>
                    <td className="py-3 px-2 text-right">
                      <div className="text-green-600">
                        <p className="font-medium">+$124.00</p>
                        <p className="text-xs">+2.51%</p>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Close
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Positions Table - Mobile */}
            <div className="md:hidden space-y-4">
              {/* Position 1 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">BTC-USD</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">10x</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Long</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+$54.67</p>
                    <p className="text-xs text-green-600">+1.02%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span> 0.1234
                  </div>
                  <div>
                    <span className="text-gray-600">Entry:</span> $43,125
                  </div>
                  <div>
                    <span className="text-gray-600">Mark:</span> $43,567
                  </div>
                  <div>
                    <span className="text-gray-600">Liq:</span> <span className="text-red-600">$38,450</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-red-600 hover:text-red-700">
                  Close Position
                </Button>
              </div>

              {/* Position 2 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">ETH-USD</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">5x</span>
                    </div>
                    <span className="text-sm text-red-600 font-medium">Short</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+$116.88</p>
                    <p className="text-xs text-green-600">+2.08%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span> 2.5000
                  </div>
                  <div>
                    <span className="text-gray-600">Entry:</span> $2,245
                  </div>
                  <div>
                    <span className="text-gray-600">Mark:</span> $2,198
                  </div>
                  <div>
                    <span className="text-gray-600">Liq:</span> <span className="text-red-600">$2,450</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-red-600 hover:text-red-700">
                  Close Position
                </Button>
              </div>

              {/* Position 3 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">SOL-USD</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">3x</span>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Long</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+$124.00</p>
                    <p className="text-xs text-green-600">+2.51%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Size:</span> 50.0000
                  </div>
                  <div>
                    <span className="text-gray-600">Entry:</span> $98.75
                  </div>
                  <div>
                    <span className="text-gray-600">Mark:</span> $101.23
                  </div>
                  <div>
                    <span className="text-gray-600">Liq:</span> <span className="text-red-600">$82.50</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3 text-red-600 hover:text-red-700">
                  Close Position
                </Button>
              </div>
            </div>

            {/* Position Controls */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Default Leverage:</span>
                <Select defaultValue="10">
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                    <SelectItem value="3">3x</SelectItem>
                    <SelectItem value="5">5x</SelectItem>
                    <SelectItem value="10">10x</SelectItem>
                    <SelectItem value="20">20x</SelectItem>
                    <SelectItem value="50">50x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Cross Margin:</span>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Order Book Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Order Book</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Bids */}
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">Bids</h4>
                <div className="space-y-1">
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-green-600">${bid.price}</span>
                      <span className="text-gray-600">{bid.amount}</span>
                      <span className="text-gray-500">${bid.total}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Asks */}
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Asks</h4>
                <div className="space-y-1">
                  {orderBook.asks.map((ask, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-red-600">${ask.price}</span>
                      <span className="text-gray-600">{ask.amount}</span>
                      <span className="text-gray-500">${ask.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Spread Indicator */}
            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-gray-600">
                Spread: <span className="font-medium">$2.50</span> (0.006%)
              </p>
            </div>
          </Card>

          {/* Recent Trades */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  43,567.50
                </span>
                <span className="text-gray-600">0.1234 BTC</span>
                <span className="text-gray-500">14:32:15</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 flex items-center">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  43,567.00
                </span>
                <span className="text-gray-600">0.5000 BTC</span>
                <span className="text-gray-500">14:32:12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  43,567.25
                </span>
                <span className="text-gray-600">0.2500 BTC</span>
                <span className="text-gray-500">14:32:08</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  43,566.75
                </span>
                <span className="text-gray-600">1.0000 BTC</span>
                <span className="text-gray-500">14:32:05</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 flex items-center">
                  <ArrowDown className="w-3 h-3 mr-1" />
                  43,566.50
                </span>
                <span className="text-gray-600">0.3750 BTC</span>
                <span className="text-gray-500">14:32:01</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Cap</p>
                <p className="text-lg font-semibold">$850.3B</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Circulating Supply</p>
                <p className="text-lg font-semibold">19.5M BTC</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">24h Trades</p>
                <p className="text-lg font-semibold">1.2M</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Funding Rate</p>
                <p className="text-lg font-semibold">0.01%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#003366] text-white mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2024 MarketBeat Trading. Powered by LiquidLab</p>
            <p className="text-xs text-gray-400 mt-2">
              Trading involves risk. Past performance is not indicative of future results.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}