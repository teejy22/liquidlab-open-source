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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePrivy } from "@privy-io/react-auth";

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
  const [sizeMode, setSizeMode] = useState<"asset" | "usd">("usd");
  const [collateralPercentage, setCollateralPercentage] = useState(0);
  const [leverage, setLeverage] = useState(Math.min(5, maxLeverage));
  const [showLeverageModal, setShowLeverageModal] = useState(false);
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
  
  const { login, ready } = usePrivy();
  
  const { toast } = useToast();

  // Update price when market changes or when switching to limit order
  useEffect(() => {
    if (orderType === "limit" && currentPrice > 0) {
      setPrice(currentPrice.toFixed(2));
    }
  }, [currentPrice, orderType]);

  // Calculate available collateral from account summary
  const availableCollateral = accountSummary?.freeCollateral || 0;
  
  // Update size based on collateral percentage
  useEffect(() => {
    if (collateralPercentage > 0 && availableCollateral > 0) {
      const collateralToUse = (availableCollateral * collateralPercentage) / 100;
      const notionalSize = collateralToUse * leverage;
      setSize(notionalSize.toFixed(2));
      setSizeMode("usd");
    } else if (collateralPercentage === 0) {
      setSize("");
    }
  }, [collateralPercentage, availableCollateral, leverage]);

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
    return leverage > 0 ? (orderValue / leverage).toFixed(2) : "0.00";
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
      {/* Leverage Header */}
      <button
        onClick={() => setShowLeverageModal(true)}
        className="w-full flex items-center justify-center bg-gray-900 rounded px-3 py-2 hover:bg-gray-800 transition-colors"
      >
        <span className="text-xs font-medium text-white">{leverage}x</span>
      </button>
      
      {/* Order Type */}
      <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "limit" | "market")}>
        <TabsList className="grid w-full grid-cols-2 h-8 bg-gray-900 p-0.5">
          <TabsTrigger value="market" className="text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-white">
            Market
          </TabsTrigger>
          <TabsTrigger value="limit" className="text-xs data-[state=active]:bg-gray-800 data-[state=active]:text-white">
            Limit
          </TabsTrigger>
        </TabsList>
      </Tabs>

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

      {/* Available to Trade & Current Position */}
      <div className="space-y-2 bg-gray-900/50 p-2 rounded">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">Available to Trade</span>
          <span className="text-white">${availableCollateral.toFixed(2)}</span>
        </div>
        {accountSummary?.positions && accountSummary.positions.length > 0 && (
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Current Position</span>
            <span className="text-white">
              {accountSummary.positions.find(p => p.coin === selectedMarket)?.szi || "0"} {selectedMarket}
            </span>
          </div>
        )}
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

      {/* Size Input and Percentage Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-gray-400">Size</Label>
          <button
            type="button"
            onClick={() => setSizeMode(sizeMode === "usd" ? "asset" : "usd")}
            className="text-xs font-medium text-[#1dd1a1] hover:text-[#1ab894]"
          >
            USD
          </button>
        </div>
        <Input
          type="number"
          value={size}
          onChange={(e) => {
            setSize(e.target.value);
            // Update percentage based on manual size input
            if (availableCollateral > 0 && e.target.value) {
              const orderValue = parseFloat(e.target.value);
              const requiredCollateral = orderValue / leverage;
              const percentage = (requiredCollateral / availableCollateral) * 100;
              setCollateralPercentage(Math.min(100, Math.max(0, percentage)));
            }
          }}
          placeholder={sizeMode === "usd" ? "$0.00" : "0.00"}
          className="bg-gray-900 border-gray-700 h-8 text-sm mb-2"
        />
        <Slider
          value={[collateralPercentage]}
          onValueChange={(value) => setCollateralPercentage(value[0])}
          max={100}
          min={0}
          step={1}
          className="w-full force-small-slider"
        />
        <div className="flex justify-between items-center mt-1">
          <div className="flex justify-between w-full text-[10px] text-gray-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100 %</span>
          </div>
        </div>
      </div>
      
      {/* Reduce Only and TP/SL */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-xs">
          <input
            type="checkbox"
            checked={reduceOnly}
            onChange={(e) => setReduceOnly(e.target.checked)}
            className="w-3 h-3"
          />
          <span>Reduce Only</span>
        </label>
        <label className="flex items-center space-x-2 text-xs">
          <input
            type="checkbox"
            checked={enableTP || enableSL}
            onChange={(e) => {
              setEnableTP(e.target.checked);
              setEnableSL(e.target.checked);
            }}
            className="w-3 h-3"
          />
          <span>Take Profit / Stop Loss</span>
        </label>
      </div>
      

      
      {/* Order Summary */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Total:</span>
          <span className="font-mono">${calculateOrderValue()}</span>
        </div>
      </div>
      {/* Submit Button */}
      <Button
        size="sm"
        disabled={isPlacingOrder || (!authenticated ? false : !size)}
        onClick={!authenticated ? () => {
          console.log('Connect wallet clicked, calling Privy login');
          if (ready) {
            login();
          } else {
            console.log('Privy not ready yet');
          }
        } : handleSubmit}
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

      {/* Order Information */}
      {size && parseFloat(size) > 0 && (
        <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Liquidation Price</span>
            <span className="text-white">${getTradeDetails().liquidationPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Order Value</span>
            <span className="text-white">${getTradeDetails().notionalValue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Margin Required</span>
            <span className="text-white">${getTradeDetails().requiredMargin.toFixed(2)}</span>
          </div>
        </div>
      )}

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

      {/* Leverage Adjustment Modal */}
      <Dialog open={showLeverageModal} onOpenChange={setShowLeverageModal}>
        <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Adjust Leverage</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-gray-400">Leverage</Label>
                  <span className="text-lg font-medium text-white">{leverage}x</span>
                </div>
                <Slider
                  value={[leverage]}
                  onValueChange={(value) => setLeverage(value[0])}
                  max={maxLeverage}
                  min={1}
                  step={1}
                  className="w-full force-small-slider"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  <span>1x</span>
                  {maxLeverage >= 25 && <span>{Math.round(maxLeverage * 0.25)}x</span>}
                  {maxLeverage >= 50 && <span>{Math.round(maxLeverage * 0.5)}x</span>}
                  {maxLeverage >= 75 && <span>{Math.round(maxLeverage * 0.75)}x</span>}
                  <span>{maxLeverage}x</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Leverage:</span>
                  <span className="text-white">{maxLeverage}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Selected:</span>
                  <span className="text-white">{leverage}x</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              onClick={() => setShowLeverageModal(false)}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => setShowLeverageModal(false)}
              className="bg-[#1dd1a1] hover:bg-[#1ab894] text-black"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}