import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

const ARBITRUM_CHAIN_ID = 42161;

export function HyperliquidDeposit() {
  const { authenticated, ready, getEthersProvider, user } = usePrivy();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get validated contract addresses from backend
  const { data: depositConfig, isLoading: configLoading } = useQuery({
    queryKey: ['/api/deposit/config'],
    enabled: authenticated,
  });

  // Get user balances
  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: [`/api/hyperliquid/balances/${user?.wallet?.address}`],
    enabled: !!user?.wallet?.address && authenticated,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Get Arbitrum USDC balance
  const { data: arbitrumBalance, isLoading: arbitrumLoading } = useQuery({
    queryKey: ['arbitrum-usdc-balance', user?.wallet?.address],
    queryFn: async () => {
      if (!user?.wallet?.address) return '0';
      
      const provider = await getEthersProvider();
      if (!provider) return '0';
      
      const signer = provider.getSigner();
      const { ethers } = await import('ethers');
      
      // USDC contract ABI (minimal for balanceOf)
      const usdcAbi = [
        'function balanceOf(address account) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      
      if (!depositConfig?.arbitrumUSDC) return '0';
      const usdcContract = new ethers.Contract(depositConfig.arbitrumUSDC, usdcAbi, signer);
      const balance = await usdcContract.balanceOf(user.wallet.address);
      const decimals = await usdcContract.decimals();
      
      return ethers.utils.formatUnits(balance, decimals);
    },
    enabled: !!user?.wallet?.address && authenticated,
    refetchInterval: 5000,
  });

  // Deposit mutation
  const depositMutation = useMutation({
    mutationFn: async (amount: string) => {
      const provider = await getEthersProvider();
      if (!provider) throw new Error('No wallet provider');
      
      const signer = provider.getSigner();
      const { ethers } = await import('ethers');
      
      // Check network
      const network = await provider.getNetwork();
      if (network.chainId !== ARBITRUM_CHAIN_ID) {
        throw new Error('Please switch to Arbitrum network');
      }
      
      // USDC contract ABI
      const usdcAbi = [
        'function transfer(address to, uint256 amount) returns (bool)',
        'function decimals() view returns (uint8)'
      ];
      
      if (!depositConfig?.arbitrumUSDC || !depositConfig?.hyperliquidBridge) {
        throw new Error('Contract addresses not loaded');
      }
      
      const usdcContract = new ethers.Contract(depositConfig.arbitrumUSDC, usdcAbi, signer);
      const decimals = await usdcContract.decimals();
      const amountWei = ethers.utils.parseUnits(amount, decimals);
      
      // Send USDC to bridge
      const tx = await usdcContract.transfer(depositConfig.hyperliquidBridge, amountWei);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      return {
        txHash: receipt.transactionHash,
        amount: amount
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Deposit Initiated",
        description: `Deposited ${data.amount} USDC. It will appear in your Hyperliquid account in ~1 minute.`,
      });
      setDepositAmount('');
      
      // Refresh balances after a delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['arbitrum-usdc-balance'] });
        queryClient.invalidateQueries({ queryKey: ['/api/hyperliquid/balances'] });
      }, 3000);
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Withdraw mutation
  const withdrawMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await fetch('/api/hyperliquid/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          destination: user?.wallet?.address
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Withdrawal Initiated",
        description: `Withdrawing ${withdrawAmount} USDC. It will arrive in 3-4 minutes.`,
      });
      setWithdrawAmount('');
      
      // Refresh balances
      queryClient.invalidateQueries({ queryKey: ['/api/hyperliquid/balances'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    
    if (!amount || amount < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum deposit is 5 USDC",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(arbitrumBalance || '0') < amount) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough USDC in your Arbitrum wallet",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await depositMutation.mutateAsync(depositAmount);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount < 2) {
      toast({
        title: "Invalid Amount",
        description: "Minimum withdrawal is 2 USDC (1 USDC fee)",
        variant: "destructive",
      });
      return;
    }
    
    const availableBalance = parseFloat(balances?.withdrawable || '0');
    if (availableBalance < amount) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough withdrawable USDC in your Hyperliquid account",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await withdrawMutation.mutateAsync(withdrawAmount);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!authenticated) {
    return (
      <Card className="bg-[#0d0d0d] border-gray-800">
        <CardContent className="pt-6">
          <Alert>
            <Wallet className="h-4 w-4" />
            <AlertDescription>
              Connect your wallet to deposit or withdraw funds
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const hyperliquidBalance = balances?.withdrawable || '0';
  const totalAccountValue = balances?.accountValue || '0';

  return (
    <Card className="bg-[#0d0d0d] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Manage Funds</CardTitle>
        <CardDescription className="text-gray-400">
          Deposit USDC to start trading or withdraw your profits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a1a1a] p-4 rounded">
            <p className="text-xs text-gray-400 mb-1">Arbitrum USDC</p>
            <p className="text-lg font-semibold text-white">
              {arbitrumLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `$${parseFloat(arbitrumBalance || '0').toFixed(2)}`
              )}
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded">
            <p className="text-xs text-gray-400 mb-1">Hyperliquid Balance</p>
            <p className="text-lg font-semibold text-white">
              {balancesLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `$${parseFloat(hyperliquidBalance).toFixed(2)}`
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total: ${parseFloat(totalAccountValue).toFixed(2)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a1a]">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-[#0d0d0d]">
              Deposit
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#0d0d0d]">
              Withdraw
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Deposits from Arbitrum to Hyperliquid take ~1 minute. Minimum deposit is 5 USDC.
              </AlertDescription>
            </Alert>
            
            <div>
              <Label htmlFor="deposit-amount" className="text-white">Amount (USDC)</Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="5"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="bg-[#1a1a1a] border-gray-800 text-white"
              />
            </div>
            
            <Button
              onClick={handleDeposit}
              disabled={isProcessing || depositMutation.isPending}
              className="w-full bg-[#1dd1a1] hover:bg-[#17a882] text-black"
            >
              {isProcessing || depositMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Deposit to Hyperliquid
                </>
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="withdraw" className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Withdrawals to Arbitrum take 3-4 minutes. 1 USDC fee is deducted.
              </AlertDescription>
            </Alert>
            
            <div>
              <Label htmlFor="withdraw-amount" className="text-white">Amount (USDC)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="2"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-[#1a1a1a] border-gray-800 text-white"
              />
            </div>
            
            <Button
              onClick={handleWithdraw}
              disabled={isProcessing || withdrawMutation.isPending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing || withdrawMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Withdraw to Arbitrum'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}