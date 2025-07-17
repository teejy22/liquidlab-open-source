import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Users, Trophy, DollarSign, Activity, Trash2, Edit } from "lucide-react";

interface TraderActivity {
  id: number;
  platformId: number;
  walletAddress: string;
  totalVolume: string;
  totalFees: string;
  tradeCount: number;
  averageTradeSize: string;
  firstTradeAt: string;
  lastTradeAt: string;
  currentTier?: IncentiveTier;
}

interface IncentiveTier {
  id: number;
  platformId: number;
  name: string;
  minVolume: string;
  rewardType: string;
  rewardValue: string;
  description: string;
  isActive: boolean;
}

interface TraderAnalyticsProps {
  platformId: number;
}

export function TraderAnalytics({ platformId }: TraderAnalyticsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState<'volume' | 'fees' | 'trades'>('volume');
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<IncentiveTier | null>(null);
  const [tierForm, setTierForm] = useState({
    name: "",
    minVolume: "",
    rewardType: "fee_discount",
    rewardValue: "",
    description: ""
  });

  // Fetch top traders
  const { data: topTraders, isLoading: loadingTraders } = useQuery({
    queryKey: [`/api/platforms/${platformId}/traders/top`],
    enabled: !!platformId
  });

  // Fetch all traders with sorting
  const { data: allTraders } = useQuery({
    queryKey: [`/api/platforms/${platformId}/traders`, sortBy],
    queryFn: async () => {
      const response = await fetch(`/api/platforms/${platformId}/traders?sortBy=${sortBy}`);
      if (!response.ok) throw new Error('Failed to fetch traders');
      return response.json();
    },
    enabled: !!platformId
  });

  // Fetch incentive tiers
  const { data: incentiveTiers, isLoading: loadingTiers } = useQuery({
    queryKey: [`/api/platforms/${platformId}/incentive-tiers`],
    enabled: !!platformId
  });

  // Create incentive tier mutation
  const createTierMutation = useMutation({
    mutationFn: async (data: typeof tierForm) => {
      return apiRequest(`/api/platforms/${platformId}/incentive-tiers`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/incentive-tiers`] });
      toast({
        title: "Success",
        description: "Incentive tier created successfully"
      });
      setShowTierDialog(false);
      resetTierForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update incentive tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ tierId, data }: { tierId: number; data: Partial<IncentiveTier> }) => {
      return apiRequest(`/api/platforms/${platformId}/incentive-tiers/${tierId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/incentive-tiers`] });
      toast({
        title: "Success",
        description: "Incentive tier updated successfully"
      });
      setShowTierDialog(false);
      setEditingTier(null);
      resetTierForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete incentive tier mutation
  const deleteTierMutation = useMutation({
    mutationFn: async (tierId: number) => {
      return apiRequest(`/api/platforms/${platformId}/incentive-tiers/${tierId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/platforms/${platformId}/incentive-tiers`] });
      toast({
        title: "Success",
        description: "Incentive tier deleted successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const resetTierForm = () => {
    setTierForm({
      name: "",
      minVolume: "",
      rewardType: "fee_discount",
      rewardValue: "",
      description: ""
    });
  };

  const handleEditTier = (tier: IncentiveTier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      minVolume: tier.minVolume,
      rewardType: tier.rewardType,
      rewardValue: tier.rewardValue,
      description: tier.description || ""
    });
    setShowTierDialog(true);
  };

  const handleSaveTier = () => {
    if (editingTier) {
      updateTierMutation.mutate({
        tierId: editingTier.id,
        data: tierForm
      });
    } else {
      createTierMutation.mutate(tierForm);
    }
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loadingTraders || loadingTiers) {
    return <div className="flex items-center justify-center h-64">Loading trader analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Traders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">{allTraders?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {formatVolume(
                  allTraders?.reduce((sum: number, t: TraderActivity) => 
                    sum + parseFloat(t.totalVolume), 0
                  ).toString() || "0"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {formatVolume(
                  allTraders?.reduce((sum: number, t: TraderActivity) => 
                    sum + parseFloat(t.totalFees), 0
                  ).toString() || "0"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <p className="text-2xl font-bold">
                {formatVolume(
                  allTraders?.length > 0 
                    ? (allTraders.reduce((sum: number, t: TraderActivity) => 
                        sum + parseFloat(t.averageTradeSize), 0
                      ) / allTraders.length).toString()
                    : "0"
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traders">Top Traders</TabsTrigger>
          <TabsTrigger value="incentives">Incentive Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="traders" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Top Traders</CardTitle>
                  <CardDescription>Your platform's most active traders</CardDescription>
                </div>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volume">By Volume</SelectItem>
                    <SelectItem value="fees">By Fees</SelectItem>
                    <SelectItem value="trades">By Trades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topTraders?.map((trader: TraderActivity, index: number) => (
                  <div key={trader.walletAddress} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">{trader.walletAddress}</p>
                        <p className="text-xs text-muted-foreground">
                          {trader.tradeCount} trades • First: {formatDate(trader.firstTradeAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatVolume(trader.totalVolume)}</p>
                      <p className="text-xs text-muted-foreground">
                        Fees: {formatVolume(trader.totalFees)}
                      </p>
                      {trader.currentTier && (
                        <p className="text-xs text-primary font-medium">
                          {trader.currentTier.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incentives" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Incentive Tiers</CardTitle>
                  <CardDescription>Reward your traders based on their volume</CardDescription>
                </div>
                <Button onClick={() => {
                  setEditingTier(null);
                  resetTierForm();
                  setShowTierDialog(true);
                }}>
                  Create Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {incentiveTiers?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No incentive tiers created yet. Create your first tier to reward loyal traders.
                  </p>
                )}
                {incentiveTiers?.map((tier: IncentiveTier) => (
                  <div key={tier.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        {tier.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Min Volume: {formatVolume(tier.minVolume)} • 
                        {tier.rewardType === 'fee_discount' && ` ${tier.rewardValue}% fee discount`}
                        {tier.rewardType === 'rebate' && ` ${tier.rewardValue}% rebate`}
                        {tier.rewardType === 'custom' && ` ${tier.rewardValue}`}
                      </p>
                      {tier.description && (
                        <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTier(tier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTierMutation.mutate(tier.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Tier Dialog */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTier ? 'Edit Incentive Tier' : 'Create Incentive Tier'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Tier Name</Label>
              <Input
                id="name"
                value={tierForm.name}
                onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                placeholder="e.g., Bronze Trader"
              />
            </div>
            <div>
              <Label htmlFor="minVolume">Minimum Volume (USD)</Label>
              <Input
                id="minVolume"
                type="number"
                value={tierForm.minVolume}
                onChange={(e) => setTierForm({ ...tierForm, minVolume: e.target.value })}
                placeholder="e.g., 10000"
              />
            </div>
            <div>
              <Label htmlFor="rewardType">Reward Type</Label>
              <Select 
                value={tierForm.rewardType} 
                onValueChange={(value) => setTierForm({ ...tierForm, rewardType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fee_discount">Fee Discount</SelectItem>
                  <SelectItem value="rebate">Volume Rebate</SelectItem>
                  <SelectItem value="custom">Custom Reward</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rewardValue">
                {tierForm.rewardType === 'fee_discount' && 'Discount Percentage'}
                {tierForm.rewardType === 'rebate' && 'Rebate Percentage'}
                {tierForm.rewardType === 'custom' && 'Reward Details'}
              </Label>
              <Input
                id="rewardValue"
                value={tierForm.rewardValue}
                onChange={(e) => setTierForm({ ...tierForm, rewardValue: e.target.value })}
                placeholder={tierForm.rewardType === 'custom' ? 'e.g., Priority support' : 'e.g., 10'}
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={tierForm.description}
                onChange={(e) => setTierForm({ ...tierForm, description: e.target.value })}
                placeholder="Additional benefits or details"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTier}>
              {editingTier ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}