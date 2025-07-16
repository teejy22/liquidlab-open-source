import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Market {
  id: string;
  question: string;
  category: string;
  volume: number;
  liquidity: number;
  endDate: string;
  outcomes: {
    id: string;
    name: string;
    price: number;
    probability: number;
  }[];
}

export function PolymarketInterface() {
  const { authenticated, user, getEthereumProvider } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('');
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const { toast } = useToast();

  // Check current network only if authenticated
  useEffect(() => {
    if (authenticated) {
      checkNetwork();
    }
  }, [authenticated]);

  const checkNetwork = async () => {
    if (!authenticated) return;
    
    try {
      const provider = await getEthereumProvider();
      if (provider) {
        const chainId = await provider.request({ method: 'eth_chainId' });
        setCurrentNetwork(chainId);
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  };

  // Switch to Polygon network
  const switchToPolygon = async () => {
    try {
      if (!authenticated) {
        toast({
          title: "Connect wallet first",
          description: "Please connect your wallet to place predictions",
          variant: "destructive",
        });
        return;
      }

      const provider = await getEthereumProvider();
      if (!provider) {
        toast({
          title: "Wallet not connected",
          description: "Please connect your wallet first",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      // Polygon network parameters
      const polygonChainId = '0x89'; // 137 in hex
      
      try {
        // Try to switch to Polygon
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: polygonChainId }],
        });
        
        setCurrentNetwork(polygonChainId);
        toast({
          title: "Network switched",
          description: "Successfully switched to Polygon network",
        });
      } catch (switchError: any) {
        // If the chain is not added, add it
        if (switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: polygonChainId,
              chainName: 'Polygon',
              nativeCurrency: {
                name: 'MATIC',
                symbol: 'MATIC',
                decimals: 18,
              },
              rpcUrls: ['https://polygon-rpc.com/'],
              blockExplorerUrls: ['https://polygonscan.com/'],
            }],
          });
          
          setCurrentNetwork(polygonChainId);
          toast({
            title: "Network added",
            description: "Polygon network added and switched successfully",
          });
        } else {
          throw switchError;
        }
      }
    } catch (error) {
      console.error('Error switching network:', error);
      toast({
        title: "Network switch failed",
        description: "Failed to switch to Polygon network",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch sample markets - always load them, regardless of auth status
  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    // Sample data for testing
    const sampleMarkets: Market[] = [
      {
        id: '1',
        question: 'Will BTC reach $150,000 by March 2025?',
        category: 'Crypto',
        volume: 2500000,
        liquidity: 500000,
        endDate: '2025-03-31',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.35, probability: 35 },
          { id: 'no', name: 'No', price: 0.65, probability: 65 }
        ]
      },
      {
        id: '2',
        question: 'Will the Fed cut rates in Q1 2025?',
        category: 'Economics',
        volume: 1800000,
        liquidity: 400000,
        endDate: '2025-03-31',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.72, probability: 72 },
          { id: 'no', name: 'No', price: 0.28, probability: 28 }
        ]
      },
      {
        id: '3',
        question: 'Will ETH ETF see $1B inflows by February?',
        category: 'Crypto',
        volume: 950000,
        liquidity: 200000,
        endDate: '2025-02-28',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.45, probability: 45 },
          { id: 'no', name: 'No', price: 0.55, probability: 55 }
        ]
      }
    ];
    
    setMarkets(sampleMarkets);
  };

  const placeBet = async () => {
    if (!selectedMarket || !selectedOutcome || !betAmount) {
      toast({
        title: "Missing information",
        description: "Please select a market, outcome, and enter an amount",
        variant: "destructive",
      });
      return;
    }

    // Check authentication first
    if (!authenticated) {
      toast({
        title: "Connect wallet",
        description: "Please connect your wallet to place predictions",
        variant: "destructive",
      });
      return;
    }

    // Check network
    if (currentNetwork !== '0x89') {
      await switchToPolygon();
      return;
    }

    const platformFee = parseFloat(betAmount) * 0.005; // 0.5% fee
    const totalAmount = parseFloat(betAmount) + platformFee;

    toast({
      title: "Bet placement",
      description: `Total: $${totalAmount.toFixed(2)} (includes $${platformFee.toFixed(2)} platform fee)`,
    });

    // In production, this would interact with Polymarket contracts
  };



  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Prediction Markets</h2>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400">
            Premium Feature
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Markets List */}
        <div className="w-1/2 border-r border-gray-800 overflow-y-auto">
          <div className="p-4 space-y-3">
            {markets.map((market) => (
              <Card 
                key={market.id}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedMarket?.id === market.id 
                    ? 'bg-purple-900/30 border-purple-600' 
                    : 'bg-[#1a1a1a] border-gray-800 hover:bg-[#222]'
                }`}
                onClick={() => setSelectedMarket(market)}
              >
                <div className="space-y-2">
                  <p className="font-medium">{market.question}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Badge variant="outline" className="text-xs">
                      {market.category}
                    </Badge>
                    <span>Vol: ${(market.volume / 1000000).toFixed(1)}M</span>
                    <span>Ends: {new Date(market.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex space-x-2 mt-2">
                    {market.outcomes.map((outcome) => (
                      <div key={outcome.id} className="flex-1">
                        <div className="bg-[#0d0d0d] rounded p-2 text-center">
                          <p className="text-xs text-gray-400">{outcome.name}</p>
                          <p className="font-bold">{outcome.probability}%</p>
                          <p className="text-xs text-gray-500">${outcome.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Betting Interface */}
        <div className="w-1/2 p-4">
          {selectedMarket ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{selectedMarket.question}</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Select Outcome</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {selectedMarket.outcomes.map((outcome) => (
                      <Button
                        key={outcome.id}
                        variant={selectedOutcome === outcome.id ? "default" : "outline"}
                        className={selectedOutcome === outcome.id ? "bg-purple-600" : ""}
                        onClick={() => setSelectedOutcome(outcome.id)}
                      >
                        {outcome.name} ({outcome.probability}%)
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Bet Amount (USDC)</label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
                      placeholder="0.00"
                    />
                  </div>
                  {betAmount && (
                    <p className="text-xs text-gray-400 mt-1">
                      Platform fee (0.5%): ${(parseFloat(betAmount) * 0.005).toFixed(2)}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={placeBet}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={!selectedOutcome || !betAmount}
                >
                  Place Prediction
                </Button>
              </div>

              <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg">
                <h4 className="font-medium mb-2">Market Stats</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volume:</span>
                    <span>${(selectedMarket.volume / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Liquidity:</span>
                    <span>${(selectedMarket.liquidity / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ends:</span>
                    <span>{new Date(selectedMarket.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a market to place a prediction
            </div>
          )}
        </div>
      </div>
    </div>
  );
}