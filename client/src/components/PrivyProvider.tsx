import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Privy config from backend
    console.log('Fetching Privy config...');
    fetch('/api/privy/config')
      .then(res => res.json())
      .then(data => {
        console.log('Privy config received:', data);
        if (data.appId) {
          setAppId(data.appId);
        } else {
          console.error('Privy App ID not found in config');
        }
      })
      .catch(err => {
        console.error('Error fetching Privy config:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    console.log('Privy loading...');
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Initializing wallet connection...</div>
      </div>
    );
  }
  
  if (!appId) {
    console.error('Privy App ID not found');
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-red-400">Error: Wallet configuration not found</div>
      </div>
    );
  }

  console.log('Initializing Privy with appId:', appId);
  
  return (
    <Privy
      appId={appId}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#00d4ff',
          logo: '/liquidlab-logo.png',
        },
        loginMethods: ['wallet', 'email', 'sms'],
        embeddedWallets: {
          createOnLogin: 'all-users',
        },
        defaultChain: {
          id: 42161,
          name: 'Arbitrum One',
          network: 'arbitrum',
          nativeCurrency: {
            decimals: 18,
            name: 'Ether',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ['https://arb1.arbitrum.io/rpc'],
            },
          },
        },
        supportedChains: [
          {
            id: 42161,
            name: 'Arbitrum One',
            network: 'arbitrum',
            nativeCurrency: {
              decimals: 18,
              name: 'Ether',
              symbol: 'ETH',
            },
            rpcUrls: {
              default: {
                http: ['https://arb1.arbitrum.io/rpc'],
              },
            },
          },
          {
            id: 137,
            name: 'Polygon',
            network: 'polygon',
            nativeCurrency: {
              decimals: 18,
              name: 'MATIC',
              symbol: 'MATIC',
            },
            rpcUrls: {
              default: {
                http: ['https://polygon-rpc.com'],
              },
            },
          },
        ],
      }}
    >
      {children}
    </Privy>
  );
}