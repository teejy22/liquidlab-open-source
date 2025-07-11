import { WalletState } from "@/types";

export class WalletService {
  private static instance: WalletService;
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    balance: null,
    networkId: null,
  };
  private listeners: ((state: WalletState) => void)[] = [];

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  async connectWallet(): Promise<WalletState> {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = await this.getBalance(address);
          const networkId = await this.getNetworkId();
          
          this.walletState = {
            isConnected: true,
            address,
            balance,
            networkId,
          };
          
          this.notifyListeners();
          return this.walletState;
        }
      } else {
        throw new Error('MetaMask is not installed');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
    
    return this.walletState;
  }

  async disconnectWallet(): Promise<void> {
    this.walletState = {
      isConnected: false,
      address: null,
      balance: null,
      networkId: null,
    };
    this.notifyListeners();
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      return (parseInt(balance, 16) / 1e18).toFixed(4);
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  async getNetworkId(): Promise<number> {
    try {
      const networkId = await window.ethereum.request({
        method: 'eth_chainId',
      });
      return parseInt(networkId, 16);
    } catch (error) {
      console.error('Failed to get network ID:', error);
      return 1;
    }
  }

  getWalletState(): WalletState {
    return this.walletState;
  }

  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.walletState));
  }
}

export const walletService = WalletService.getInstance();
