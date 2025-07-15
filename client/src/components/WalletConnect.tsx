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
      <Button 
        onClick={logout} 
        variant="outline" 
        size="sm"
        className="hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {displayAddress}
      </Button>
    );
  }

  return (
    <Button 
      onClick={login} 
      variant="default" 
      size="sm"
      className="bg-[#00d4ff] hover:bg-[#00a8cc] text-black pl-[5px] pr-[5px] ml-[8px] mr-[8px]"
    >
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
}