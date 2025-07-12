import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, BarChart3, Smartphone, Minimize2, TrendingUp, X } from "lucide-react";
import { Link } from "wouter";

interface TemplatePreviewProps {
  template: any;
  children: React.ReactNode;
}

export default function TemplatePreview({ template, children }: TemplatePreviewProps) {
  const getFullPreview = () => {
    const colors = {
      'Professional': 'bg-gray-900 text-white',
      'Mobile First': 'bg-indigo-900 text-white',
      'Minimal': 'bg-gray-100 text-gray-900',
      'Analytics': 'bg-blue-900 text-white',
      'DeFi': 'bg-green-900 text-white'
    };

    return (
      <div className={`${colors[template.category as keyof typeof colors]} p-8 rounded-lg min-h-[400px] relative`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">{template.name}</h2>
            <Badge className="bg-liquid-green text-white">{template.category}</Badge>
          </div>
          <div className="text-green-400 font-mono text-lg">$67,845.32</div>
        </div>

        {/* Mock Trading Interface */}
        <div className="grid grid-cols-12 gap-4 h-80">
          {/* Left Panel - Market Data */}
          <div className="col-span-3 space-y-4">
            <div className="bg-black/20 p-4 rounded">
              <h3 className="text-sm font-semibold mb-2">Market Data</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>ETH/USD</span>
                  <span className="text-green-400">+2.34%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>BTC/USD</span>
                  <span className="text-red-400">-1.23%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>SOL/USD</span>
                  <span className="text-green-400">+5.67%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 p-4 rounded">
              <h3 className="text-sm font-semibold mb-2">Order Book</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">67,845</span>
                  <span>0.234</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">67,840</span>
                  <span>0.156</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-400">67,850</span>
                  <span>0.891</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Chart */}
          <div className="col-span-6 bg-black/20 p-4 rounded">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold">ETH/USD Chart</h3>
              <div className="flex space-x-2">
                <span className="text-xs bg-liquid-green px-2 py-1 rounded">1H</span>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">4H</span>
                <span className="text-xs bg-gray-600 px-2 py-1 rounded">1D</span>
              </div>
            </div>
            <div className="h-48 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs opacity-70">TradingView Chart</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Trading */}
          <div className="col-span-3 space-y-4">
            <div className="bg-black/20 p-4 rounded">
              <h3 className="text-sm font-semibold mb-2">Trade</h3>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs">Buy</button>
                  <button className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs">Sell</button>
                </div>
                <div className="text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Amount:</span>
                    <span>0.5 ETH</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>Price:</span>
                    <span>$67,845</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>$33,922.50</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black/20 p-4 rounded">
              <h3 className="text-sm font-semibold mb-2">Portfolio</h3>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>ETH</span>
                  <span>2.34</span>
                </div>
                <div className="flex justify-between">
                  <span>BTC</span>
                  <span>0.045</span>
                </div>
                <div className="flex justify-between">
                  <span>USDC</span>
                  <span>1,247.89</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">+12.34%</div>
              <div className="text-xs opacity-70">24h Change</div>
            </div>
            <div>
              <div className="text-lg font-bold">$2.4M</div>
              <div className="text-xs opacity-70">Volume</div>
            </div>
            <div>
              <div className="text-lg font-bold">1,247</div>
              <div className="text-xs opacity-70">Active Users</div>
            </div>
            <div>
              <div className="text-lg font-bold">$156.78</div>
              <div className="text-xs opacity-70">Avg Trade</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template.name} - Preview</span>
            <div className="flex items-center space-x-2">
              <Link href={`/builder/${template.id}`}>
                <Button className="bg-liquid-green text-white hover:bg-liquid-accent">
                  Use This Template
                </Button>
              </Link>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {template.features.map((feature: string, index: number) => (
              <Badge key={index} variant="secondary">
                {feature}
              </Badge>
            ))}
          </div>
          
          <p className="text-gray-600">{template.description}</p>
          
          {getFullPreview()}
          
          <div className="text-sm text-gray-500 text-center">
            This is a preview of the template. The actual trading platform will have live data and full functionality.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}