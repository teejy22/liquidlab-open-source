import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export function WalletConnect() {
  const { ready, authenticated, user, login, logout } = usePrivy();

  // Listen for custom login event from other components
  useEffect(() => {
    const handlePrivyLogin = () => {
      if (ready && !authenticated) {
        login();
      }
    };

    window.addEventListener('privy:login', handlePrivyLogin);
    return () => window.removeEventListener('privy:login', handlePrivyLogin);
  }, [ready, authenticated, login]);

  // Save wallet address when user connects
  useEffect(() => {
    const saveWalletAddress = async () => {
      if (authenticated && user && user.wallet?.address && user.email?.address) {
        try {
          await apiRequest('/api/privy/wallet', {
            method: 'POST',
            body: JSON.stringify({
              walletAddress: user.wallet.address,
              email: user.email.address
            })
          });
          console.log('Wallet address saved successfully');
        } catch (error) {
          console.error('Error saving wallet address:', error);
        }
      }
    };

    saveWalletAddress();
  }, [authenticated, user]);

  if (!ready) {
    return (
      <Button disabled variant="outline" size="sm">
        <Wallet className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (authenticated && user) {
    const address = user.wallet?.address || user.email?.address || 'Connected';
    const displayAddress = address.length > 10 
      ? `${address.slice(0, 6)}...${address.slice(-4)}` 
      : address;

    return (
      <button 
        onClick={logout} 
        className="h-8 px-4 text-sm font-medium text-[#1dd1a1] bg-[#0a0a0a] border border-[#1dd1a1]/20 rounded hover:bg-[#1dd1a1]/10 hover:border-[#1dd1a1]/40 transition-all duration-200 flex items-center gap-2"
      >
        <div className="w-1.5 h-1.5 bg-[#1dd1a1] rounded-full" />
        <span>{displayAddress}</span>
      </button>
    );
  }

  return (
    <button 
      onClick={login} 
      className="h-8 px-4 text-sm font-medium text-black bg-[#1dd1a1] rounded hover:bg-[#19b894] transition-all duration-200"
    >
      Connect
    </button>
  );
}