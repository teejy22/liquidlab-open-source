import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { walletService } from "@/lib/wallet";
import { WalletState } from "@/types";
import { Wallet, Copy, ExternalLink, CheckCircle } from "lucide-react";

export default function WalletConnection() {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getWalletState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await walletService.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await walletService.disconnectWallet();
  };

  const handleCopyAddress = async () => {
    if (walletState.address) {
      await navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!walletState.isConnected) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-liquid-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-liquid-green" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <p className="text-sm text-gray-600">
            Connect your wallet to start building and earning revenue
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-liquid-green text-white hover:bg-liquid-accent"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            We support MetaMask, WalletConnect, and other popular wallets
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <CardTitle>Wallet Connected</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Address</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="p-1 h-auto"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto"
                onClick={() => window.open(`https://etherscan.io/address/${walletState.address}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
          <p className="font-mono text-sm">{formatAddress(walletState.address!)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Balance</span>
            <Badge variant="outline">ETH</Badge>
          </div>
          <p className="text-lg font-semibold">{walletState.balance}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Network</span>
            <Badge variant="outline">
              {walletState.networkId === 1 ? 'Mainnet' : `Chain ${walletState.networkId}`}
            </Badge>
          </div>
        </div>

        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="w-full"
        >
          Disconnect
        </Button>
      </CardContent>
    </Card>
  );
}
