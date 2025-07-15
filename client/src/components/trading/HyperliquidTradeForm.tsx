import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useHyperliquidTrading } from "@/hooks/useHyperliquidTrading";
import { Loader2 } from "lucide-react";
import { TradeConfirmationDialog } from "./TradeConfirmationDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // TP/SL states
  const [enableTP, setEnableTP] = useState(false);
  const [enableSL, setEnableSL] = useState(false);
  const [tpPrice, setTpPrice] = useState("");
  const [slPrice, setSlPrice] = useState("");
  const [tpMode, setTpMode] = useState<"price" | "percentage">("price");
  const [slMode, setSlMode] = useState<"price" | "percentage">("price");
  const [tpPercentage, setTpPercentage] = useState("");
  const [slPercentage, setSlPercentage] = useState("");

  const { 
    authenticated, 
    placeOrder, 
    isPlacingOrder,
    accountSummary 
  } = useHyperliquidTrading();
  
  const { toast } = useToast();

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

  // Calculate TP/SL prices based on percentage
  useEffect(() => {
    const entryPrice = orderType === "limit" && price ? parseFloat(price) : currentPrice;
    if (entryPrice > 0) {
      // Update TP price if in percentage mode
      if (tpMode === "percentage" && tpPercentage) {
        const tpPercent = parseFloat(tpPercentage);
        const calculatedTpPrice = side === "buy" 
          ? entryPrice * (1 + tpPercent / 100)
          : entryPrice * (1 - tpPercent / 100);
        setTpPrice(calculatedTpPrice.toFixed(2));
      }
      
      // Update SL price if in percentage mode
      if (slMode === "percentage" && slPercentage) {
        const slPercent = parseFloat(slPercentage);
        const calculatedSlPrice = side === "buy"
          ? entryPrice * (1 - slPercent / 100)
          : entryPrice * (1 + slPercent / 100);
        setSlPrice(calculatedSlPrice.toFixed(2));
      }
    }
  }, [tpMode, slMode, tpPercentage, slPercentage, price, currentPrice, orderType, side]);

  const handleSubmit = async () => {
    if (!size || parseFloat(size) <= 0) {
      toast({
        title: "Invalid size",
        description: "Please enter a valid order size",
        variant: "destructive",
      });
      return;
    }

    if (orderType === "limit" && (!price || parseFloat(price) <= 0)) {
      toast({
        title: "Invalid price",
        description: "Please enter a valid limit price",
        variant: "destructive",
      });
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmOrder = async () => {
    // Calculate actual size based on mode
    let actualSize = parseFloat(size);
    if (sizeMode === "usd") {
      const orderPrice = orderType === "limit" && price ? parseFloat(price) : currentPrice;
      if (orderPrice > 0) {
        actualSize = parseFloat(size) / orderPrice;
      }
    }

    try {
      await placeOrder({
        symbol: selectedMarket,
        side,
        price: orderType === "limit" ? parseFloat(price) : 0,
        size: actualSize,
        orderType,
        reduceOnly,
        postOnly: orderType === "limit" && postOnly,
        ioc: orderType === "market",
        tpPrice: enableTP && tpPrice ? parseFloat(tpPrice) : undefined,
        slPrice: enableSL && slPrice ? parseFloat(slPrice) : undefined,
      });

      // Reset form after successful order
      setSize("");
      setShowConfirmDialog(false);
    } catch (error) {
      // Error handling is done in the hook
      setShowConfirmDialog(false);
    }
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

  const calculateLiquidationPrice = () => {
    if (!size || parseFloat(size) <= 0) return undefined;
    
    const orderPrice = orderType === "limit" && price ? parseFloat(price) : currentPrice;
    const orderSize = sizeMode === "usd" ? parseFloat(size) / orderPrice : parseFloat(size);
    
    // Liquidation price calculation
    // For longs: Entry Price * (1 - 1/leverage + maintenance margin)
    // For shorts: Entry Price * (1 + 1/leverage - maintenance margin)
    const maintenanceMargin = 0.005; // 0.5% maintenance margin
    
    if (side === "buy") {
      return orderPrice * (1 - 1/leverage + maintenanceMargin);
    } else {
      return orderPrice * (1 + 1/leverage - maintenanceMargin);
    }
  };

  const calculateFee = () => {
    const orderValue = parseFloat(calculateOrderValue());
    return orderValue * 0.001; // 0.1% taker fee
  };

  const getTradeDetails = () => {
    const orderPrice = orderType === "limit" && price ? parseFloat(price) : currentPrice;
    const orderSize = sizeMode === "usd" ? parseFloat(size) / orderPrice : parseFloat(size);
    const notionalValue = parseFloat(calculateOrderValue());
    const requiredMargin = parseFloat(calculateMarginRequired());
    const fee = calculateFee();
    const liquidationPrice = calculateLiquidationPrice();

    return {
      orderPrice,
      orderSize,
      notionalValue,
      requiredMargin,
      fee,
      liquidationPrice
    };
  };

  return (
    <div className="p-4 space-y-3">
      {/* Buy/Sell Toggle */}
      <Tabs value={side} onValueChange={(v) => setSide(v as "buy" | "sell")}>
        <TabsList className="grid w-full grid-cols-2 h-8 bg-gray-900 p-0.5">
          <TabsTrigger value="buy" className="text-xs data-[state=active]:bg-[#1dd1a1] data-[state=active]:text-black data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-400">
            Buy / Long
          </TabsTrigger>
          <TabsTrigger value="sell" className="text-xs data-[state=active]:bg-[#f56565] data-[state=active]:text-white data-[state=inactive]:bg-gray-800 data-[state=inactive]:text-gray-400">
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
                  ? "bg-[#1dd1a1] text-black" 
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
                  ? "bg-[#1dd1a1] text-black" 
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
      
      {/* Take Profit / Stop Loss */}
      <div className="space-y-3 border-t border-gray-800 pt-3 mt-4 bg-gray-900/50 p-3 rounded-lg">
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Risk Management</h4>
        {/* Take Profit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enableTP}
                onChange={(e) => setEnableTP(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-[#1dd1a1] focus:ring-[#1dd1a1] focus:ring-offset-0"
              />
              <span className="text-xs font-medium text-gray-300">Take Profit</span>
            </label>
            {enableTP && (
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setTpMode("price")}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    tpMode === "price" 
                      ? "bg-[#1dd1a1] text-black" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Price
                </button>
                <button
                  type="button"
                  onClick={() => setTpMode("percentage")}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    tpMode === "percentage" 
                      ? "bg-[#1dd1a1] text-black" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  %
                </button>
              </div>
            )}
          </div>
          {enableTP && (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={tpMode === "price" ? tpPrice : tpPercentage}
                onChange={(e) => tpMode === "price" ? setTpPrice(e.target.value) : setTpPercentage(e.target.value)}
                placeholder={tpMode === "price" ? "TP Price" : "TP %"}
                disabled={!enableTP}
                className="bg-gray-900 border-gray-700 h-7 text-xs"
              />
              {tpMode === "percentage" && tpPrice && (
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  = ${tpPrice}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stop Loss */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={enableSL}
                onChange={(e) => setEnableSL(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-[#f56565] focus:ring-[#f56565] focus:ring-offset-0"
              />
              <span className="text-xs font-medium text-gray-300">Stop Loss</span>
            </label>
            {enableSL && (
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setSlMode("price")}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    slMode === "price" 
                      ? "bg-[#f56565] text-white" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Price
                </button>
                <button
                  type="button"
                  onClick={() => setSlMode("percentage")}
                  className={`px-2 py-0.5 text-[10px] rounded ${
                    slMode === "percentage" 
                      ? "bg-[#f56565] text-white" 
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  %
                </button>
              </div>
            )}
          </div>
          {enableSL && (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={slMode === "price" ? slPrice : slPercentage}
                onChange={(e) => slMode === "price" ? setSlPrice(e.target.value) : setSlPercentage(e.target.value)}
                placeholder={slMode === "price" ? "SL Price" : "SL %"}
                disabled={!enableSL}
                className="bg-gray-900 border-gray-700 h-7 text-xs"
              />
              {slMode === "percentage" && slPrice && (
                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                  = ${slPrice}
                </span>
              )}
            </div>
          )}
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
        className={`w-full h-9 text-sm font-medium rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
          side === "buy" 
            ? "text-black bg-[#1dd1a1] hover:bg-[#19b894]" 
            : "text-white bg-[#f56565] hover:bg-[#e53e3e]"
        }`}
      >
        {isPlacingOrder ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing Order...
          </>
        ) : !authenticated ? (
          "Connect Wallet"
        ) : (
          `${side === "buy" ? "Buy Long" : "Sell Short"} ${sizeMode === "usd" ? "$" : ""}${size || "0"} ${sizeMode === "usd" ? "USD" : selectedMarket}`
        )}
      </Button>

      {/* Trade Confirmation Dialog */}
      <TradeConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmOrder}
        market={selectedMarket}
        side={side}
        size={parseFloat(size || "0")}
        price={getTradeDetails().orderPrice}
        leverage={leverage}
        isMarketOrder={orderType === "market"}
        markPrice={currentPrice}
        liquidationPrice={getTradeDetails().liquidationPrice}
        notionalValue={getTradeDetails().notionalValue}
        requiredMargin={getTradeDetails().requiredMargin}
        fee={getTradeDetails().fee}
        isReduceOnly={reduceOnly}
        sizeMode={sizeMode}
        tpPrice={enableTP && tpPrice ? parseFloat(tpPrice) : undefined}
        slPrice={enableSL && slPrice ? parseFloat(slPrice) : undefined}
      />
    </div>
  );
}