import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function TestWalletInput() {
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress || !email) {
      toast({
        title: "Error",
        description: "Please enter both wallet address and email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/api/privy/wallet', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress,
          email
        })
      });
      
      toast({
        title: "Success",
        description: "Wallet address saved! You can now place trades with builder fee tracking.",
      });
      
      setWalletAddress('');
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save wallet address",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Test Wallet Connection</CardTitle>
        <CardDescription>
          Manually enter your wallet address for testing. Use this if Privy is not working due to domain restrictions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Wallet Address</label>
            <Input
              type="text"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Wallet Address"}
          </Button>
        </form>
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-semibold mb-1">How to test:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Enter your Hyperliquid wallet address above</li>
            <li>Go to Hyperliquid and place a trade</li>
            <li>Trades will automatically include builder fee tracking</li>
            <li>Wait up to 10 minutes for processing</li>
            <li>Check your dashboard for earnings</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}