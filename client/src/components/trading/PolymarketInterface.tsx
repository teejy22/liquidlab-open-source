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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
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
      },
      {
        id: '4',
        question: 'Will SOL reach $250 before ETH reaches $5000?',
        category: 'Crypto',
        volume: 1200000,
        liquidity: 300000,
        endDate: '2025-06-30',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.62, probability: 62 },
          { id: 'no', name: 'No', price: 0.38, probability: 38 }
        ]
      },
      {
        id: '5',
        question: 'Will Trump launch a crypto token in 2025?',
        category: 'Politics',
        volume: 3200000,
        liquidity: 800000,
        endDate: '2025-12-31',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.41, probability: 41 },
          { id: 'no', name: 'No', price: 0.59, probability: 59 }
        ]
      },
      {
        id: '6',
        question: 'Will CPI be below 2.5% by April 2025?',
        category: 'Economics',
        volume: 875000,
        liquidity: 150000,
        endDate: '2025-04-30',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.28, probability: 28 },
          { id: 'no', name: 'No', price: 0.72, probability: 72 }
        ]
      },
      {
        id: '7',
        question: 'Will Chiefs win Super Bowl LIX?',
        category: 'Sports',
        volume: 4500000,
        liquidity: 1200000,
        endDate: '2025-02-09',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.38, probability: 38 },
          { id: 'no', name: 'No', price: 0.62, probability: 62 }
        ]
      },
      {
        id: '8',
        question: 'Will Lakers make NBA playoffs 2025?',
        category: 'Sports',
        volume: 2300000,
        liquidity: 600000,
        endDate: '2025-04-15',
        outcomes: [
          { id: 'yes', name: 'Yes', price: 0.67, probability: 67 },
          { id: 'no', name: 'No', price: 0.33, probability: 33 }
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
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Prediction Markets</h2>
          <Badge variant="secondary" className="bg-purple-600/20 text-purple-400 text-[10px] px-2 py-0.5">
            Premium
          </Badge>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex"  style={{ height: 'calc(100% - 60px)' }}>
        {/* Markets List */}
        <div className={`${selectedMarket ? 'w-2/3 border-r' : 'w-full'} border-gray-800 overflow-y-auto custom-scrollbar h-full`}>
          {/* Category Filter */}
          <div className="p-3 border-b border-gray-800 overflow-x-auto custom-scrollbar-horizontal">
            <div className="flex gap-2 min-w-max">
              {['All', 'Crypto', 'Politics', 'Economics', 'Sports'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  className={`h-7 text-xs whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === category 
                      ? 'bg-purple-600 hover:bg-purple-700 border-purple-600' 
                      : 'bg-[#0d0d0d] border-gray-700 hover:border-purple-600 text-gray-300'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {markets
              .filter(market => selectedCategory === 'All' || market.category === selectedCategory)
              .map((market) => (
              <Card 
                key={market.id}
                className={`p-3 cursor-pointer transition-all ${
                  selectedMarket?.id === market.id 
                    ? 'bg-purple-900/20 border-purple-600/50 ring-1 ring-purple-600/50' 
                    : 'bg-[#0d0d0d] border-gray-800 hover:bg-[#1a1a1a] hover:border-gray-700'
                }`}
                onClick={() => setSelectedMarket(market)}
              >
                <div className="space-y-2">
                  <p className="text-sm font-medium leading-tight text-white">{market.question}</p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-600 text-gray-300">
                      {market.category}
                    </Badge>
                    <span>Vol: ${(market.volume / 1000000).toFixed(1)}M</span>
                    <span>Ends: {new Date(market.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {market.outcomes.map((outcome) => (
                      <div key={outcome.id} className={`
                        rounded px-3 py-1.5 text-center
                        ${outcome.name === 'Yes' 
                          ? 'bg-green-950/50 border border-green-900/50' 
                          : 'bg-red-950/50 border border-red-900/50'
                        }
                      `}>
                        <p className="text-[10px] text-gray-300">{outcome.name}</p>
                        <p className="text-base font-bold text-white">
                          {outcome.probability}%
                        </p>
                        <p className="text-[10px] text-gray-400">${outcome.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Betting Interface */}
        {selectedMarket && (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-4">
              <Card className="bg-[#0d0d0d] border-gray-800 p-4">
                <h3 className="text-sm font-semibold mb-3">{selectedMarket.question}</h3>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {selectedMarket.outcomes.map((outcome) => (
                      <Button
                        key={outcome.id}
                        variant={selectedOutcome === outcome.id ? "default" : "outline"}
                        className={`h-14 ${
                          selectedOutcome === outcome.id 
                            ? outcome.name === 'Yes'
                              ? 'bg-green-600 hover:bg-green-700 border-green-600' 
                              : 'bg-red-600 hover:bg-red-700 border-red-600'
                            : 'bg-[#1a1a1a] border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedOutcome(outcome.id)}
                      >
                        <div>
                          <p className="text-xs">{outcome.name}</p>
                          <p className="text-lg font-bold">${outcome.price.toFixed(2)}</p>
                          <p className="text-[10px] text-gray-400">{outcome.probability}%</p>
                        </div>
                      </Button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-400">Amount (USDC)</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="bg-black border-gray-700 h-9 text-sm"
                    />
                  </div>

                  {betAmount && selectedOutcome && (
                    <div className="bg-[#1a1a1a] rounded p-3 space-y-1.5 text-xs border border-gray-800">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shares</span>
                        <span className="font-mono">
                          {(parseFloat(betAmount) / 
                            (selectedMarket.outcomes.find(o => o.id === selectedOutcome)?.price || 1)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Platform Fee (0.5%)</span>
                        <span className="font-mono">${(parseFloat(betAmount) * 0.005).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-sm pt-1 border-t border-gray-800">
                        <span>Total</span>
                        <span className="font-mono">${(parseFloat(betAmount) * 1.005).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 h-9 text-sm font-semibold"
                    onClick={placeBet}
                    disabled={!selectedOutcome || !betAmount}
                  >
                    Place Prediction
                  </Button>
                </div>
              </Card>

              <Card className="bg-[#0d0d0d] border-gray-800 p-3">
                <h4 className="text-xs font-semibold mb-2 text-gray-400">MARKET INFO</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Volume</span>
                    <span className="font-mono">${(selectedMarket.volume / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Liquidity</span>
                    <span className="font-mono">${(selectedMarket.liquidity / 1000000).toFixed(2)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ends</span>
                    <span>{new Date(selectedMarket.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}