import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { walletService } from "@/lib/wallet";
import { WalletState } from "@/types";
import { Wallet, Menu, X } from "lucide-react";
import logoImage from "@assets/Trade_1752276632533.png";

export default function Header() {
  const [location] = useLocation();
  const [walletState, setWalletState] = useState<WalletState>(walletService.getWalletState());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = walletService.subscribe(setWalletState);
    return unsubscribe;
  }, []);

  const handleConnectWallet = async () => {
    try {
      await walletService.connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    await walletService.disconnectWallet();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="LiquidLab Logo" 
              className="h-8 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/templates" className={`font-medium transition-colors ${
              isActive('/templates') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Templates
            </Link>
            <Link href="/builder" className={`font-medium transition-colors ${
              isActive('/builder') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Builder
            </Link>
            <Link href="/analytics" className={`font-medium transition-colors ${
              isActive('/analytics') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Analytics
            </Link>
            <Link href="/dashboard" className={`font-medium transition-colors ${
              isActive('/dashboard') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Dashboard
            </Link>
          </nav>
          
          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {walletState.isConnected ? (
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {formatAddress(walletState.address!)}
                </span>
                <span className="text-sm text-gray-500">
                  {walletState.balance} ETH
                </span>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <Wallet className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Not Connected</span>
              </div>
            )}
            
            <Button
              onClick={walletState.isConnected ? handleDisconnectWallet : handleConnectWallet}
              className="bg-liquid-green text-white hover:bg-liquid-accent transition-colors"
            >
              {walletState.isConnected ? 'Disconnect' : 'Connect Wallet'}
            </Button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              <Link href="/templates" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/templates') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Templates
              </Link>
              <Link href="/builder" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/builder') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Builder
              </Link>
              <Link href="/analytics" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/analytics') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Analytics
              </Link>
              <Link href="/dashboard" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/dashboard') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Dashboard
              </Link>
            </nav>
            
            {walletState.isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {formatAddress(walletState.address!)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {walletState.balance} ETH
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
