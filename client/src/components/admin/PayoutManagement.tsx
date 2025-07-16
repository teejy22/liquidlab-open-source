import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertCircle, 
  CheckCircle, 
  DollarSign, 
  RefreshCw, 
  Wallet,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface PayoutReadiness {
  unclaimedFees: string;
  claimedNotConverted: string;
  availableForPayout: string;
  requiredForPayouts: string;
  readyToPayout: boolean;
  details: {
    platformId: number;
    unclaimedAmount: string;
    requiredAmount: string;
  }[];
}

interface WalletBalances {
  payoutWallet: {
    usdc: string;
    address: string;
  };
  builderWallet: {
    hyperliquid: string;
    address: string;
  };
}

export function PayoutManagement() {
  const { toast } = useToast();
  const [claimData, setClaimData] = useState({
    startDate: '',
    endDate: '',
    claimTxHash: ''
  });
  const [transferAmount, setTransferAmount] = useState('');

  // Fetch payout readiness
  const { data: readiness, isLoading: readinessLoading, refetch: refetchReadiness } = useQuery<PayoutReadiness>({
    queryKey: ['/api/admin/payout-readiness'],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch wallet balances
  const { data: balances, refetch: refetchBalances } = useQuery<WalletBalances>({
    queryKey: ['/api/admin/wallet-balances'],
    refetchInterval: 30000
  });

  // Fetch unclaimed fees
  const { data: unclaimedFees } = useQuery({
    queryKey: ['/api/admin/unclaimed-fees'],
    refetchInterval: 30000
  });

  // Mark fees as claimed mutation
  const claimFeesMutation = useMutation({
    mutationFn: async (data: typeof claimData) => {
      return await apiRequest('/api/admin/claim-fees', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Fees Marked as Claimed",
        description: "Successfully updated fee status in the database",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payout-readiness'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/unclaimed-fees'] });
      setClaimData({ startDate: '', endDate: '', claimTxHash: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark fees as claimed",
        variant: "destructive",
      });
    }
  });

  // Transfer to payout wallet mutation
  const transferMutation = useMutation({
    mutationFn: async (amount: string) => {
      return await apiRequest('/api/admin/transfer-to-payout', {
        method: 'POST',
        body: JSON.stringify({ amount })
      });
    },
    onSuccess: () => {
      toast({
        title: "Transfer Initiated",
        description: "USDC transfer to payout wallet started",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/wallet-balances'] });
      setTransferAmount('');
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to transfer funds",
        variant: "destructive",
      });
    }
  });

  // Process payouts mutation
  const processPayoutsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/payouts/process', {
        method: 'POST',
        body: JSON.stringify({ period: 'weekly' })
      });
    },
    onSuccess: () => {
      toast({
        title: "Payouts Started",
        description: "Payout processing has been initiated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payout Error",
        description: error.message || "Failed to start payouts",
        variant: "destructive",
      });
    }
  });

  if (readinessLoading) {
    return <div>Loading payout status...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Payout Readiness Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Payout Readiness Status</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                refetchReadiness();
                refetchBalances();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readiness && (
            <div className="space-y-4">
              {/* Overall Status */}
              <Alert variant={readiness.readyToPayout ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {readiness.readyToPayout ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {readiness.readyToPayout ? "Ready for Payouts" : "Not Ready for Payouts"}
                  </AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {readiness.readyToPayout 
                    ? "All requirements met. You can process payouts now."
                    : "Please claim builder fees and ensure sufficient USDC balance before processing payouts."}
                </AlertDescription>
              </Alert>

              {/* Fee Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${readiness.unclaimedFees}</div>
                    <p className="text-xs text-muted-foreground">Unclaimed Fees on Hyperliquid</p>
                    {parseFloat(readiness.unclaimedFees) > 0 && (
                      <Badge variant="outline" className="mt-2">Action Required</Badge>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${readiness.claimedNotConverted}</div>
                    <p className="text-xs text-muted-foreground">Claimed but Not Converted</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${readiness.availableForPayout}</div>
                    <p className="text-xs text-muted-foreground">Available USDC</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">${readiness.requiredForPayouts}</div>
                    <p className="text-xs text-muted-foreground">Required for Payouts</p>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Details */}
              {readiness.details.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Platform Breakdown</h4>
                  <div className="space-y-2">
                    {readiness.details.map((detail) => (
                      <div key={detail.platformId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">Platform #{detail.platformId}</span>
                        <div className="text-sm text-right">
                          <div>Unclaimed: ${detail.unclaimedAmount}</div>
                          <div className="text-xs text-gray-500">Required: ${detail.requiredAmount}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Wallet Balances */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balances</CardTitle>
        </CardHeader>
        <CardContent>
          {balances && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4" />
                  <span className="font-semibold">Builder Wallet (Hyperliquid)</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{balances.builderWallet.address}</p>
                <p className="text-xl font-bold">${balances.builderWallet.hyperliquid}</p>
                <p className="text-xs text-gray-500 mt-1">Unclaimed fees on Hyperliquid</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-semibold">Payout Wallet (Arbitrum)</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{balances.payoutWallet.address}</p>
                <p className="text-xl font-bold">${balances.payoutWallet.usdc} USDC</p>
                <p className="text-xs text-gray-500 mt-1">Available for distribution</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claim Management */}
      <Card>
        <CardHeader>
          <CardTitle>Claim Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Manual Process Required</AlertTitle>
              <AlertDescription>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Go to Hyperliquid and claim builder fees</li>
                  <li>Note the transaction hash and date range</li>
                  <li>Mark fees as claimed below</li>
                  <li>Convert to USDC and transfer to payout wallet</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={claimData.startDate}
                  onChange={(e) => setClaimData({ ...claimData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={claimData.endDate}
                  onChange={(e) => setClaimData({ ...claimData, endDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="claimTxHash">Claim Transaction Hash</Label>
                <Input
                  id="claimTxHash"
                  placeholder="0x..."
                  value={claimData.claimTxHash}
                  onChange={(e) => setClaimData({ ...claimData, claimTxHash: e.target.value })}
                />
              </div>
            </div>
            <Button
              onClick={() => claimFeesMutation.mutate(claimData)}
              disabled={!claimData.startDate || !claimData.endDate || !claimData.claimTxHash || claimFeesMutation.isPending}
            >
              Mark Fees as Claimed
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer to Payout Wallet */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer USDC to Payout Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="transferAmount">Amount (USDC)</Label>
                <Input
                  id="transferAmount"
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => transferMutation.mutate(transferAmount)}
                  disabled={!transferAmount || parseFloat(transferAmount) <= 0 || transferMutation.isPending}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Transfer to Payout Wallet
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Process Weekly Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Process weekly payouts to all eligible platform owners
              </p>
              {readiness && !readiness.readyToPayout && (
                <p className="text-sm text-red-600 mt-1">
                  ⚠️ System is not ready for payouts. Please complete the steps above first.
                </p>
              )}
            </div>
            <Button
              onClick={() => processPayoutsMutation.mutate()}
              disabled={!readiness?.readyToPayout || processPayoutsMutation.isPending}
              variant={readiness?.readyToPayout ? "default" : "secondary"}
            >
              {processPayoutsMutation.isPending ? "Processing..." : "Process Payouts"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}