import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { walletService } from "@/lib/wallet";
import { WalletState } from "@/types";
import { Wallet, Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import logoImage from "@assets/Trade (5)_1752280465910.png";

export default function Header() {
  const [location] = useLocation();
  const [walletState, setWalletState] = useState<WalletState>(walletService.getWalletState());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { toast } = useToast();

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

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of LiquidLab",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 md:h-36">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src={logoImage} 
              alt="LiquidLab Logo" 
              className="h-28 md:h-32 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">

            <Link href="/pricing" className={`font-medium transition-colors ${
              isActive('/pricing') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Pricing
            </Link>
            <Link href="/education" className={`font-medium transition-colors ${
              isActive('/education') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Education
            </Link>
            <Link href="/builder" className={`font-medium transition-colors ${
              isActive('/builder') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Builder
            </Link>
            <Link href="/example" className={`font-medium transition-colors ${
              isActive('/example') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Example
            </Link>
            <Link href="/enterprise" className={`font-medium transition-colors ${
              isActive('/enterprise') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
            }`}>
              Enterprise
            </Link>
            {isAuthenticated && (
              <>
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
              </>
            )}
          </nav>
          
          {/* Authentication */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="hidden md:inline">{user?.username || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-liquid-green text-white hover:bg-liquid-accent transition-colors">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
              <Link href="/pricing" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/pricing') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Pricing
              </Link>
              <Link href="/education" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/education') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Education
              </Link>
              <Link href="/builder" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/builder') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Builder
              </Link>
              <Link href="/example" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/example') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Example
              </Link>
              <Link href="/enterprise" className={`block px-3 py-2 text-base font-medium transition-colors ${
                isActive('/enterprise') ? 'text-liquid-green' : 'text-gray-600 hover:text-liquid-green'
              }`}>
                Enterprise
              </Link>
              {isAuthenticated && (
                <>
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
                </>
              )}
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
