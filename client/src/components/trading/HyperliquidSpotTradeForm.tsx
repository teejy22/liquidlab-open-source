import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { placeSpotOrder } from '@/lib/hyperliquid-spot';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { SpotMarket } from '@/lib/hyperliquid-spot';

interface HyperliquidSpotTradeFormProps {
  selectedMarket: SpotMarket | null;
  address: string;
  onOrderPlaced?: () => void;
}

export function HyperliquidSpotTradeForm({ selectedMarket, address, onOrderPlaced }: HyperliquidSpotTradeFormProps) {
  const { getEthersProvider } = usePrivy();
  const { toast } = useToast();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [total, setTotal] = useState('0.00');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    calculateTotal();
  }, [amount, limitPrice, orderType, selectedMarket]);

  const calculateTotal = () => {
    if (!amount || !selectedMarket) {
      setTotal('0.00');
      return;
    }

    const amountNum = parseFloat(amount);
    const priceNum = orderType === 'market' 
      ? parseFloat(selectedMarket.markPrice)
      : parseFloat(limitPrice || '0');

    if (amountNum > 0 && priceNum > 0) {
      setTotal((amountNum * priceNum).toFixed(2));
    } else {
      setTotal('0.00');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMarket) {
      toast({
        title: 'No Market Selected',
        description: 'Please select a market to trade',
        variant: 'destructive'
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: 'Invalid Price',
        description: 'Please enter a valid limit price',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const provider = await getEthersProvider();
      if (!provider) throw new Error('No provider available');
      
      const signer = await provider.getSigner();
      const nonce = Date.now();
      
      const result = await placeSpotOrder(
        signer,
        selectedMarket.token,
        side === 'buy',
        amount,
        orderType === 'limit' ? limitPrice : null,
        nonce
      );

      if (result.success) {
        toast({
          title: 'Order Placed',
          description: `${side.toUpperCase()} ${amount} ${selectedMarket.token} ${orderType === 'limit' ? `@ $${limitPrice}` : 'at market'}`
        });
        setAmount('');
        setLimitPrice('');
        onOrderPlaced?.();
      } else {
        throw new Error(result.error || 'Order failed');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'Order Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!selectedMarket) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="text-center py-8 text-gray-500">
          Select a market to trade
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Trade {selectedMarket.token}/USDC</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Buy/Sell Tabs */}
        <Tabs value={side} onValueChange={(v) => setSide(v as 'buy' | 'sell')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Buy
            </TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Order Type */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={orderType === 'limit' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('limit')}
            className="flex-1"
          >
            Limit
          </Button>
          <Button
            type="button"
            variant={orderType === 'market' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOrderType('market')}
            className="flex-1"
          >
            Market
          </Button>
        </div>

        {/* Price Input (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <Label htmlFor="price" className="text-xs text-gray-400">
              Price (USDC)
            </Label>
            <Input
              id="price"
              type="number"
              step="any"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={selectedMarket.markPrice}
              disabled={submitting}
            />
          </div>
        )}

        {/* Amount Input */}
        <div>
          <Label htmlFor="amount" className="text-xs text-gray-400">
            Amount ({selectedMarket.token})
          </Label>
          <Input
            id="amount"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={submitting}
          />
        </div>

        {/* Total Display */}
        <div className="bg-gray-800 rounded p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Total</span>
            <span className="font-mono">${total} USDC</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submitting || !amount || (orderType === 'limit' && !limitPrice)}
          className={`w-full ${
            side === 'buy' 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Placing Order...
            </>
          ) : (
            `${side === 'buy' ? 'Buy' : 'Sell'} ${selectedMarket.token}`
          )}
        </Button>
      </form>

      {/* Market Info */}
      <div className="mt-4 pt-4 border-t border-gray-800 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Mark Price</span>
          <span className="font-mono">${selectedMarket.markPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Change</span>
          <span className={parseFloat(selectedMarket.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}>
            {parseFloat(selectedMarket.change24h) >= 0 ? '+' : ''}{selectedMarket.change24h}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">24h Volume</span>
          <span className="font-mono">${parseFloat(selectedMarket.volume24h).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}