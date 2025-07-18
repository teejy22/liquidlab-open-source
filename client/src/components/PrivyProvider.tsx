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

  if (loading || !appId) {
    return <>{children}</>;
  }

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
        walletConnectCloudProjectId: 'YOUR_WALLET_CONNECT_PROJECT_ID', // Optional
        embeddedWallets: {
          createOnLogin: 'all-users',
        },

      }}
    >
      {children}
    </Privy>
  );
}