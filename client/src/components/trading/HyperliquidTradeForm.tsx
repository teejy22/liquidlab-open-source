import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useHyperliquidTrading } from "@/hooks/useHyperliquidTrading";
import { Loader2 } from "lucide-react";

interface HyperliquidTradeFormProps {
  selectedMarket: string;
  currentPrice: number;
  maxLeverage?: number;
}

export function HyperliquidTradeForm({ selectedMarket, currentPrice, maxLeverage = 100 }: HyperliquidTradeFormProps) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [sizeMode, setSizeMode] = useState<"asset" | "usd">("asset");
  const [leverage, setLeverage] = useState(1);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);

  const { 
    authenticated, 
    placeOrder, 
    isPlacingOrder,
    accountSummary 
  } = useHyperliquidTrading();

  // Update price when market changes or when switching to limit order
  useEffect(() => {
    if (orderType === "limit" && currentPrice > 0) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, orderType]);

  // Update leverage when maxLeverage changes
  useEffect(() => {
    if (leverage > maxLeverage) {
      setLeverage(maxLeverage);
    }
  }, [maxLeverage, leverage]);

  const handleSubmit = async () => {
    if (!size || parseFloat(size) <= 0) {
      return;
    }

    if (orderType === "limit" && (!price || parseFloat(price) <= 0)) {
      return;
    }

    // Calculate actual size based on mode
    let actualSize = parseFloat(size);
    if (sizeMode === "usd") {
      const orderPrice = orderType === "limit" && price ? parseFloat(price) : currentPrice;
      if (orderPrice > 0) {
        actualSize = parseFloat(size) / orderPrice;
      }
    }

    await placeOrder({
      symbol: selectedMarket,
      side,
      price: orderType === "limit" ? parseFloat(price) : 0,
      size: actualSize,
      orderType,
      reduceOnly,
      postOnly: orderType === "limit" && postOnly,
      ioc: orderType === "market",
    });

    // Reset form after successful order
    setSize("");
  };

  const calculateOrderValue = () => {
    if (!size) return "0.00";
    
    if (sizeMode === "usd") {
      // If user entered USD, the order value is what they entered
      return parseFloat(size).toFixed(2);
    } else {
      // If user entered asset amount, calculate USD value
      const orderPrice = orderType === "limit" && price ? parseFloat(price) : currentPrice;
      return (parseFloat(size) * orderPrice).toFixed(2);
    }
  };

  const calculateMarginRequired = () => {
    const orderValue = parseFloat(calculateOrderValue());
    const leverageNum = parseFloat(leverage);
    return leverageNum > 0 ? (orderValue / leverageNum).toFixed(2) : "0.00";
  };

  return (
    <div className="p-4 space-y-3">
      {/* Buy/Sell Toggle */}
      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
        <TabsList className="grid w-full grid-cols-2 h-8 bg-gray-900 p-0.5">
          <TabsTrigger value="buy" className="text-xs data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-400">
            Buy / Long
          </TabsTrigger>
          <TabsTrigger value="sell" className="text-xs data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-400">
            Sell / Short
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Order Type */}
      <div className="flex items-center space-x-2">
        <Select value={orderType} onValueChange={(v) => setOrderType(v as "limit" | "market")}>
          <SelectTrigger className="w-24 h-8 text-xs bg-gray-900 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem value="limit" className="text-gray-200 focus:bg-gray-800 focus:text-white">Limit</SelectItem>
            <SelectItem value="market" className="text-gray-200 focus:bg-gray-800 focus:text-white">Market</SelectItem>
          </SelectContent>
        </Select>
        
        {orderType === "limit" && (
          <label className="flex items-center space-x-1 text-xs">
            <input
              type="checkbox"
              checked={postOnly}
              onChange={(e) => setPostOnly(e.target.checked)}
              className="w-3 h-3"
            />
            <span>Post Only</span>
          </label>
        )}
        
        <label className="flex items-center space-x-1 text-xs ml-auto">
          <input
            type="checkbox"
            checked={reduceOnly}
            onChange={(e) => setReduceOnly(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Reduce Only</span>
        </label>
      </div>

      {/* Price Input (for limit orders) */}
      {orderType === "limit" && (
        <div>
          <Label className="text-xs text-gray-400">Price</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="bg-gray-900 border-gray-700 h-8 text-sm"
          />
        </div>
      )}

      {/* Size Input with Mode Toggle */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label className="text-xs text-gray-400">
            Size {sizeMode === "asset" ? `(${selectedMarket})` : "(USD)"}
          </Label>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setSizeMode("asset")}
              className={`px-2 py-0.5 text-xs rounded ${
                sizeMode === "asset" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {selectedMarket}
            </button>
            <button
              type="button"
              onClick={() => setSizeMode("usd")}
              className={`px-2 py-0.5 text-xs rounded ${
                sizeMode === "usd" 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              USD
            </button>
          </div>
        </div>
        <Input
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder={sizeMode === "asset" ? "0.00" : "$0.00"}
          className="bg-gray-900 border-gray-700 h-8 text-sm"
        />
      </div>

      {/* Leverage Selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-400">Leverage</Label>
          <span className="text-sm font-medium text-white">{leverage}x</span>
        </div>
        <Slider
          value={[leverage]}
          onValueChange={(value) => setLeverage(value[0])}
          max={maxLeverage}
          min={1}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>1x</span>
          {maxLeverage >= 25 && <span>{Math.round(maxLeverage * 0.25)}x</span>}
          {maxLeverage >= 50 && <span>{Math.round(maxLeverage * 0.5)}x</span>}
          {maxLeverage >= 75 && <span>{Math.round(maxLeverage * 0.75)}x</span>}
          <span>{maxLeverage}x</span>
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-800 pt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Order Value:</span>
          <span className="font-mono">${calculateOrderValue()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Margin Required:</span>
          <span className="font-mono">${calculateMarginRequired()}</span>
        </div>
        {accountSummary && (
          <div className="flex justify-between">
            <span className="text-gray-400">Available:</span>
            <span className="font-mono">
              ${parseFloat(accountSummary.withdrawable).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        size="sm"
        disabled={isPlacingOrder || (!authenticated ? false : !size)}
        onClick={!authenticated ? () => window.dispatchEvent(new CustomEvent('privy:login')) : handleSubmit}
        className={`w-full h-9 ${
          !authenticated ? "bg-[#00d4ff] hover:bg-[#00a8cc] text-black" :
          side === "buy"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        } ${isPlacingOrder ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isPlacingOrder ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing Order...
          </>
        ) : !authenticated ? (
          "Connect Wallet"
        ) : (
          `${side === "buy" ? "Buy Long" : "Sell Short"} ${size || "0"} ${selectedMarket}`
        )}
      </Button>
    </div>
  );
}