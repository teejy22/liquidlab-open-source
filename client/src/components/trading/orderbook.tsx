import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { hyperliquidAPI } from "@/lib/hyperliquid";
import { OrderbookData } from "@/types";
import { TrendingUp, TrendingDown } from "lucide-react";

interface OrderbookProps {
  symbol: string;
  height?: number;
  showHeader?: boolean;
}

export default function Orderbook({ symbol, height = 400, showHeader = true }: OrderbookProps) {
  const [spread, setSpread] = useState<number>(0);
  const [midPrice, setMidPrice] = useState<number>(0);

  const { data: orderbook, isLoading, error } = useQuery({
    queryKey: ['/api/hyperliquid/orderbook', symbol],
    queryFn: () => hyperliquidAPI.getOrderbook(symbol),
    refetchInterval: 5000, // Update every 5 seconds
    enabled: !!symbol
  });

  useEffect(() => {
    if (orderbook?.bids?.length && orderbook?.asks?.length) {
      const bestBid = parseFloat(orderbook.bids[0][0]);
      const bestAsk = parseFloat(orderbook.asks[0][0]);
      const currentSpread = bestAsk - bestBid;
      const currentMidPrice = (bestBid + bestAsk) / 2;
      
      setSpread(currentSpread);
      setMidPrice(currentMidPrice);
    }
  }, [orderbook]);

  const formatPrice = (price: string | number) => {
    return parseFloat(price.toString()).toFixed(2);
  };

  const formatSize = (size: string | number) => {
    return parseFloat(size.toString()).toFixed(4);
  };

  const formatSpread = (spread: number) => {
    return spread.toFixed(2);
  };

  if (isLoading) {
    return (
      <Card className="w-full" style={{ height }}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Order Book</span>
              <Skeleton className="h-6 w-20" />
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full" style={{ height }}>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle>Order Book</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Failed to load order book</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" style={{ height }}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Order Book</span>
            <Badge variant="outline">{symbol}</Badge>
          </CardTitle>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Spread: ${formatSpread(spread)}</span>
            <span>Mid: ${formatPrice(midPrice)}</span>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-0 h-full">
          {/* Bids */}
          <div className="border-r">
            <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 border-b">
              <div className="flex justify-between">
                <span>Price</span>
                <span>Size</span>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ height: height - 120 }}>
              {orderbook?.bids?.slice(0, 15).map((bid, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-3 py-1 text-xs hover:bg-green-50 border-b border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="font-mono text-green-600">{formatPrice(bid[0])}</span>
                  </div>
                  <span className="font-mono text-gray-600">{formatSize(bid[1])}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asks */}
          <div>
            <div className="bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 border-b">
              <div className="flex justify-between">
                <span>Price</span>
                <span>Size</span>
              </div>
            </div>
            <div className="overflow-y-auto" style={{ height: height - 120 }}>
              {orderbook?.asks?.slice(0, 15).map((ask, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center px-3 py-1 text-xs hover:bg-red-50 border-b border-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-3 h-3 text-red-500" />
                    <span className="font-mono text-red-600">{formatPrice(ask[0])}</span>
                  </div>
                  <span className="font-mono text-gray-600">{formatSize(ask[1])}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
