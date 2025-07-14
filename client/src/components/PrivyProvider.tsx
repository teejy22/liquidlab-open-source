import { PrivyProvider as Privy } from '@privy-io/react-auth';

interface PrivyProviderProps {
  children: React.ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  // In production, this should come from a secure environment variable
  // For now, using a placeholder ID - replace with actual Privy App ID
  const appId = import.meta.env.VITE_PRIVY_APP_ID || 'clsnqcjyk05yw0fl36x7d2x3v';
  
  if (!appId) {
    console.error('Privy App ID not found. Please set VITE_PRIVY_APP_ID environment variable.');
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