import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrivy } from "@privy-io/react-auth";

interface MoonPayButtonProps {
  platformId?: number;
  className?: string;
}

export function MoonPayButton({ platformId, className }: MoonPayButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [moonpayConfig, setMoonpayConfig] = useState<{ apiKey: string } | null>(null);
  const { authenticated, user } = usePrivy();
  
  // Get wallet address from connected wallet
  const walletAddress = user?.wallet?.address || 
    (user?.linkedAccounts?.find(account => account.type === 'wallet')?.address) || 
    '';
  
  // Fetch MoonPay configuration from backend
  useEffect(() => {
    fetch('/api/moonpay/config')
      .then(res => res.json())
      .then(data => setMoonpayConfig(data))
      .catch(err => console.error('Failed to fetch MoonPay config:', err));
  }, []);
  
  // MoonPay widget URL with LiquidLab configuration
  // Note: In production, you'll need a real MoonPay API key
  const moonpayUrl = moonpayConfig?.apiKey ? 
    `https://widget.moonpay.com?apiKey=${moonpayConfig.apiKey}&currencyCode=usdc&walletAddress=${walletAddress}&colorCode=%237084FF&showWalletAddressForm=true&theme=dark&language=en` : 
    null;
  
  const handleBuyClick = () => {
    if (!moonpayConfig?.apiKey) {
      console.error('MoonPay not configured');
      return;
    }
    
    setIsOpen(true);
    
    // Track the MoonPay widget opening
    if (platformId) {
      console.log('MoonPay widget opened for platform:', platformId);
    }
  };

  // Message handler for MoonPay events
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Verify origin is from MoonPay
      if (event.origin !== 'https://widget.moonpay.com') return;
      
      // Handle transaction completion
      if (event.data?.type === 'transaction-completed' && platformId) {
        const { transactionId, cryptoAmount, fiatAmount, currency } = event.data.payload;
        
        // Record the transaction for revenue sharing
        try {
          await fetch('/api/moonpay/record', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              platformId,
              transactionId,
              purchaseAmount: fiatAmount,
              cryptoAmount,
              currency
            })
          });
        } catch (error) {
          console.error('Failed to record MoonPay transaction:', error);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [platformId]);

  return (
    <>
      <button
        onClick={handleBuyClick}
        disabled={!moonpayConfig?.apiKey}
        className={`h-8 px-4 text-sm font-medium text-[#1dd1a1] bg-[#0a0a0a] border border-[#1dd1a1]/20 rounded hover:bg-[#1dd1a1]/10 hover:border-[#1dd1a1]/40 transition-all duration-200 disabled:opacity-50 ${className}`}
      >
        Buy Crypto
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[700px] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Buy Crypto with MoonPay</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-b-lg">
            {moonpayConfig?.environment === 'test' ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <CreditCard className="w-16 h-16 text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">MoonPay Integration Ready</h3>
                <p className="text-gray-400 mb-4">
                  To enable real crypto purchases, you'll need to configure a production MoonPay API key.
                </p>
                <p className="text-sm text-gray-500">
                  Contact LiquidLab support to get your MoonPay affiliate API key set up.
                </p>
              </div>
            ) : moonpayUrl ? (
              <iframe
                src={moonpayUrl}
                className="w-full h-full border-0"
                title="MoonPay Widget"
                allow="accelerometer; autoplay; camera; gyroscope; payment"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">Loading MoonPay...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}