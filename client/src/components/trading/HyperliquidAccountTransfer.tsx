import React, { useState, useEffect } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAccountBalances, transferUSDC, AccountBalances } from '@/lib/hyperliquid-spot';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

interface HyperliquidAccountTransferProps {
  address: string;
  onTransferComplete?: () => void;
}

export function HyperliquidAccountTransfer({ address, onTransferComplete }: HyperliquidAccountTransferProps) {
  const { getEthersProvider } = usePrivy();
  const { toast } = useToast();
  const [balances, setBalances] = useState<AccountBalances | null>(null);
  const [amount, setAmount] = useState('');
  const [fromPerp, setFromPerp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [address]);

  const fetchBalances = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const accountBalances = await getAccountBalances(address);
      setBalances(accountBalances);
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid transfer amount',
        variant: 'destructive'
      });
      return;
    }

    const sourceBalance = fromPerp ? balances?.perp.usdc : balances?.spot.usdc;
    if (!sourceBalance || parseFloat(amount) > parseFloat(sourceBalance)) {
      toast({
        title: 'Insufficient Balance',
        description: `You don't have enough USDC in your ${fromPerp ? 'perp' : 'spot'} account`,
        variant: 'destructive'
      });
      return;
    }

    setTransferring(true);
    try {
      const provider = await getEthersProvider();
      if (!provider) throw new Error('No provider available');
      
      const signer = await provider.getSigner();
      const nonce = Date.now();
      
      const result = await transferUSDC(signer, amount, fromPerp, nonce);
      
      if (result.success) {
        toast({
          title: 'Transfer Successful',
          description: `Transferred ${amount} USDC from ${fromPerp ? 'perp' : 'spot'} to ${fromPerp ? 'spot' : 'perp'} account`
        });
        setAmount('');
        fetchBalances();
        onTransferComplete?.();
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: 'Transfer Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setTransferring(false);
    }
  };

  const handleMax = () => {
    const maxAmount = fromPerp ? balances?.perp.usdc : balances?.spot.usdc;
    if (maxAmount) {
      setAmount(maxAmount);
    }
  };

  const handleSwitch = () => {
    setFromPerp(!fromPerp);
  };

  if (loading && !balances) {
    return (
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Transfer USDC Between Accounts</h3>
      
      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Perp Account</div>
          <div className="text-lg font-mono">${parseFloat(balances?.perp.usdc || '0').toFixed(2)}</div>
          <div className="text-xs text-gray-500">Total: ${parseFloat(balances?.perp.totalValue || '0').toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded p-3">
          <div className="text-xs text-gray-400 mb-1">Spot Account</div>
          <div className="text-lg font-mono">${parseFloat(balances?.spot.usdc || '0').toFixed(2)}</div>
          <div className="text-xs text-gray-500">Total: ${parseFloat(balances?.spot.totalValue || '0').toFixed(2)}</div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 text-center">
            <div className="text-sm font-medium">
              {fromPerp ? 'Perp' : 'Spot'}
            </div>
          </div>
          <Button
            onClick={handleSwitch}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center">
            <div className="text-sm font-medium">
              {fromPerp ? 'Spot' : 'Perp'}
            </div>
          </div>
        </div>

        <div className="relative">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="pr-16"
            disabled={transferring}
          />
          <button
            onClick={handleMax}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-500 hover:text-blue-400 px-2 py-1"
            disabled={transferring}
          >
            MAX
          </button>
        </div>

        <Button
          onClick={handleTransfer}
          disabled={transferring || !amount || parseFloat(amount) <= 0}
          className="w-full"
        >
          {transferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Transferring...
            </>
          ) : (
            'Transfer USDC'
          )}
        </Button>
      </div>

      {/* Spot Balances */}
      {balances?.spot.balances && balances.spot.balances.length > 0 && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2">Spot Holdings</h4>
          <div className="space-y-2">
            {balances.spot.balances.map((balance) => (
              <div key={balance.token} className="flex justify-between text-sm">
                <span className="text-gray-300">{balance.token}</span>
                <div className="text-right">
                  <div className="font-mono">{parseFloat(balance.balance).toFixed(4)}</div>
                  <div className="text-xs text-gray-500">${balance.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}