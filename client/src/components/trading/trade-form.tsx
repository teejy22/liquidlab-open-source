import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { walletService } from "@/lib/wallet";
import { hyperliquidAPI } from "@/lib/hyperliquid";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";

interface TradeFormProps {
  symbol: string;
  height?: number;
  showHeader?: boolean;
}

export default function TradeForm({ symbol, height = 400, showHeader = true }: TradeFormProps) {
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [leverage, setLeverage] = useState([1]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const walletState = walletService.getWalletState();

  const { data: marketData } = useQuery({
    queryKey: ['/api/hyperliquid/market-data', symbol],
    queryFn: () => hyperliquidAPI.getMarketData(symbol),
    refetchInterval: 5000,
    enabled: !!symbol
  });

  const { data: userState } = useQuery({
    queryKey: ['/api/hyperliquid/user-state', walletState.address],
    queryFn: () => hyperliquidAPI.getUserState(walletState.address!),
    enabled: !!walletState.address
  });

  const handleSubmitOrder = async () => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to place orders",
        variant: "destructive"
      });
      return;
    }

    if (!price || !quantity) {
      toast({
        title: "Invalid order",
        description: "Please enter both price and quantity",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const order = {
        symbol,
        side,
        orderType,
        price: orderType === 'limit' ? parseFloat(price) : undefined,
        quantity: parseFloat(quantity),
        leverage: leverage[0]
      };

      await hyperliquidAPI.placeOrder(walletState.address!, order);
      
      toast({
        title: "Order placed successfully",
        description: `${side.toUpperCase()} order for ${quantity} ${symbol} has been placed`
      });
      
      // Reset form
      setPrice('');
      setQuantity('');
    } catch (error) {
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentPrice = () => {
    if (marketData && typeof marketData === 'object') {
      return Object.values(marketData)[0] || '0';
    }
    return '0';
  };

  const calculateTotal = () => {
    if (!price || !quantity) return '0';
    return (parseFloat(price) * parseFloat(quantity)).toFixed(2);
  };

  const formatBalance = (balance: string | number) => {
    return parseFloat(balance.toString()).toFixed(4);
  };

  const currentPrice = getCurrentPrice();
  const total = calculateTotal();

  return (
    <Card className="w-full" style={{ height }}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Trade</span>
            <Badge variant="outline">{symbol}</Badge>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-4">
        <Tabs value={side} onValueChange={(value) => setSide(value as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="text-green-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="text-red-600">
              <TrendingDown className="w-4 h-4 mr-2" />
              Sell
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-4 mt-4">
            <TradeFormContent
              orderType={orderType}
              setOrderType={setOrderType}
              price={price}
              setPrice={setPrice}
              quantity={quantity}
              setQuantity={setQuantity}
              leverage={leverage}
              setLeverage={setLeverage}
              currentPrice={currentPrice}
              total={total}
              side="buy"
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitOrder}
              walletConnected={walletState.isConnected}
              balance={walletState.balance || '0'}
            />
          </TabsContent>

          <TabsContent value="sell" className="space-y-4 mt-4">
            <TradeFormContent
              orderType={orderType}
              setOrderType={setOrderType}
              price={price}
              setPrice={setPrice}
              quantity={quantity}
              setQuantity={setQuantity}
              leverage={leverage}
              setLeverage={setLeverage}
              currentPrice={currentPrice}
              total={total}
              side="sell"
              isSubmitting={isSubmitting}
              onSubmit={handleSubmitOrder}
              walletConnected={walletState.isConnected}
              balance={walletState.balance || '0'}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface TradeFormContentProps {
  orderType: 'limit' | 'market';
  setOrderType: (type: 'limit' | 'market') => void;
  price: string;
  setPrice: (price: string) => void;
  quantity: string;
  setQuantity: (quantity: string) => void;
  leverage: number[];
  setLeverage: (leverage: number[]) => void;
  currentPrice: string;
  total: string;
  side: 'buy' | 'sell';
  isSubmitting: boolean;
  onSubmit: () => void;
  walletConnected: boolean;
  balance: string;
}

function TradeFormContent({
  orderType,
  setOrderType,
  price,
  setPrice,
  quantity,
  setQuantity,
  leverage,
  setLeverage,
  currentPrice,
  total,
  side,
  isSubmitting,
  onSubmit,
  walletConnected,
  balance
}: TradeFormContentProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="order-type">Order Type</Label>
        <Select value={orderType} onValueChange={(value) => setOrderType(value as 'limit' | 'market')}>
          <SelectTrigger>
            <SelectValue placeholder="Select order type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="limit">Limit Order</SelectItem>
            <SelectItem value="market">Market Order</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orderType === 'limit' && (
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={currentPrice}
            step="0.01"
          />
          <div className="text-xs text-gray-500 mt-1">
            Current: ${currentPrice}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="0.00"
          step="0.0001"
        />
      </div>

      <div>
        <Label>Leverage: {leverage[0]}x</Label>
        <Slider
          value={leverage}
          onValueChange={setLeverage}
          max={20}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1x</span>
          <span>20x</span>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Total</span>
          <span className="font-semibold">${total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Available</span>
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{balance} ETH</span>
          </div>
        </div>
      </div>

      {!walletConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Connect your wallet to place orders
            </span>
          </div>
        </div>
      )}

      <Button
        onClick={onSubmit}
        disabled={!walletConnected || isSubmitting || !quantity}
        className={`w-full ${
          side === 'buy' 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isSubmitting ? 'Placing Order...' : `${side.toUpperCase()} ${quantity || '0'}`}
      </Button>
    </div>
  );
}
