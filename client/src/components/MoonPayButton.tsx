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
  const moonpayUrl = moonpayConfig?.apiKey ? 
    `https://widget.moonpay.com?apiKey=${moonpayConfig.apiKey}&currencyCode=usdc&walletAddress=${walletAddress}&colorCode=%237084FF&showWalletAddressForm=true&theme=dark&language=en&variant=overlay` : 
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
      <Button
        onClick={handleBuyClick}
        disabled={!moonpayConfig?.apiKey}
        className={`bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white disabled:opacity-50 ${className}`}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Buy Crypto
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] h-[700px] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Buy Crypto with MoonPay</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-b-lg">
            {moonpayUrl ? (
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