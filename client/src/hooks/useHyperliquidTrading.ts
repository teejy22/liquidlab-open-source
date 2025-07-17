import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { signOrder, signBracketOrders, formatOrderRequest, HyperliquidOrder } from '@/lib/hyperliquid-signing';

export function useHyperliquidTrading() {
  const { authenticated, ready, user, getEthersProvider } = usePrivy();
  const { toast } = useToast();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Get user's wallet address
  const userAddress = user?.wallet?.address;

  // Fetch user positions
  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: [`/api/hyperliquid/user-positions/${userAddress}`],
    enabled: !!userAddress && authenticated,
    refetchInterval: 2000, // Refresh every 2 seconds
  });

  // Fetch open orders
  const { data: openOrders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/hyperliquid/open-orders/${userAddress}`],
    enabled: !!userAddress && authenticated,
    refetchInterval: 2000,
  });

  // Place order mutation
  const placeOrderMutation = useMutation({
    mutationFn: async (orderRequest: any) => {
      const response = await fetch('/api/hyperliquid/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderRequest }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to place order');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Placed Successfully",
        description: `Order ID: ${data.response?.data?.statuses?.[0]?.resting?.oid || 'Unknown'}`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/hyperliquid/user-positions/${userAddress}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/hyperliquid/open-orders/${userAddress}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const placeOrder = async (order: HyperliquidOrder) => {
    if (!authenticated || !ready) {
      toast({
        title: "Not Connected",
        description: "Please connect your wallet to trade",
        variant: "destructive",
      });
      return;
    }

    if (!userAddress) {
      toast({
        title: "No Wallet",
        description: "No wallet address found",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);
    
    try {
      // Get the signer from Privy
      const provider = await getEthersProvider();
      if (!provider) {
        throw new Error("Failed to get wallet provider");
      }
      
      const signer = provider.getSigner();
      
      // Sign the order(s) - use bracket orders if TP/SL are set
      let signedOrders: any[];
      if (order.tpPrice || order.slPrice) {
        signedOrders = await signBracketOrders(order, signer);
      } else {
        const signedOrder = await signOrder(order, signer);
        signedOrders = [signedOrder];
      }
      
      // Format the request for Hyperliquid API
      // IMPORTANT: Lowercase the user address to avoid signature recovery issues
      const orderRequest = formatOrderRequest(userAddress.toLowerCase(), signedOrders);
      
      // Submit the order
      await placeOrderMutation.mutateAsync(orderRequest);
      
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Error",
        description: error instanceof Error ? error.message : "Failed to sign order",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Calculate account summary from positions
  const accountSummary = positions ? {
    accountValue: positions.marginSummary?.accountValue || "0",
    totalMarginUsed: positions.marginSummary?.totalMarginUsed || "0",
    totalNtlPos: positions.marginSummary?.totalNtlPos || "0",
    withdrawable: positions.withdrawable || "0",
  } : null;

  // Format positions for display
  const formattedPositions = positions?.assetPositions?.map((pos: any, index: number) => {
    const position = pos.position;
    const positionValue = parseFloat(position.szi) * parseFloat(position.entryPx || "0");
    const unrealizedPnl = parseFloat(position.unrealizedPnl || "0");
    const pnlPercentage = positionValue > 0 ? (unrealizedPnl / positionValue * 100) : 0;
    
    return {
      coin: position.coin,
      side: parseFloat(position.szi) > 0 ? 'LONG' : 'SHORT',
      size: Math.abs(parseFloat(position.szi)),
      entryPrice: parseFloat(position.entryPx || "0"),
      markPrice: parseFloat(position.markPx || "0"),
      liquidationPrice: parseFloat(position.liquidationPx || "0"),
      unrealizedPnl: unrealizedPnl,
      pnlPercentage: pnlPercentage,
      positionValue: Math.abs(positionValue),
      marginUsed: parseFloat(position.marginUsed || "0"),
    };
  }).filter((pos: any) => pos.size > 0) || [];

  return {
    authenticated,
    ready,
    userAddress,
    positions: formattedPositions,
    openOrders: openOrders || [],
    accountSummary,
    isPlacingOrder,
    positionsLoading,
    ordersLoading,
    placeOrder,
  };
}