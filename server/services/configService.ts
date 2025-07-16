// Secure configuration service for validated contract addresses
// This service provides backend-validated addresses to prevent frontend manipulation

interface ContractConfig {
  network: string;
  address: string;
  description: string;
  lastVerified: Date;
  isActive: boolean;
}

interface NetworkConfig {
  hyperliquidBridge: ContractConfig;
  arbitrumUSDC: ContractConfig;
  arbitrumRPC: string;
  minimumDepositAmount: string;
}

class ConfigurationService {
  private static readonly NETWORKS: Record<string, NetworkConfig> = {
    production: {
      hyperliquidBridge: {
        network: 'arbitrum',
        address: '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7',
        description: 'Hyperliquid Bridge Contract',
        lastVerified: new Date('2024-01-01'),
        isActive: true,
      },
      arbitrumUSDC: {
        network: 'arbitrum',
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        description: 'USDC on Arbitrum One',
        lastVerified: new Date('2024-01-01'),
        isActive: true,
      },
      arbitrumRPC: 'https://arb1.arbitrum.io/rpc',
      minimumDepositAmount: '5', // 5 USDC minimum
    },
    testnet: {
      hyperliquidBridge: {
        network: 'arbitrum-goerli',
        address: '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7', // Same for now
        description: 'Hyperliquid Bridge Contract (Testnet)',
        lastVerified: new Date('2024-01-01'),
        isActive: true,
      },
      arbitrumUSDC: {
        network: 'arbitrum-goerli',
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // Same for now
        description: 'USDC on Arbitrum Goerli',
        lastVerified: new Date('2024-01-01'),
        isActive: true,
      },
      arbitrumRPC: 'https://goerli-rollup.arbitrum.io/rpc',
      minimumDepositAmount: '1', // Lower for testing
    },
  };

  private static getEnvironment(): string {
    return process.env.NODE_ENV === 'production' ? 'production' : 'testnet';
  }

  /**
   * Get validated contract addresses for the current environment
   * This is the only source of truth for contract addresses
   */
  static getContractAddresses() {
    const env = this.getEnvironment();
    const config = this.NETWORKS[env];
    
    // Additional runtime validation
    if (!this.isValidAddress(config.hyperliquidBridge.address)) {
      throw new Error('Invalid Hyperliquid bridge address configuration');
    }
    
    if (!this.isValidAddress(config.arbitrumUSDC.address)) {
      throw new Error('Invalid USDC address configuration');
    }

    return {
      hyperliquidBridge: config.hyperliquidBridge.address,
      arbitrumUSDC: config.arbitrumUSDC.address,
      arbitrumRPC: config.arbitrumRPC,
      minimumDepositAmount: config.minimumDepositAmount,
      environment: env,
    };
  }

  /**
   * Validate an Ethereum address format
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Check if a given address matches our whitelist
   */
  static isWhitelistedAddress(address: string, type: 'bridge' | 'usdc'): boolean {
    const config = this.getContractAddresses();
    
    switch (type) {
      case 'bridge':
        return address.toLowerCase() === config.hyperliquidBridge.toLowerCase();
      case 'usdc':
        return address.toLowerCase() === config.arbitrumUSDC.toLowerCase();
      default:
        return false;
    }
  }

  /**
   * Get rate limit configuration for deposits
   */
  static getDepositRateLimits() {
    return {
      maxDepositsPerHour: 5,
      maxDepositsPerDay: 20,
      maxAmountPerDeposit: '10000', // 10,000 USDC
      maxDailyVolume: '50000', // 50,000 USDC
    };
  }

  /**
   * Validate deposit parameters
   */
  static validateDepositParams(params: {
    amount: string;
    bridgeAddress: string;
    tokenAddress: string;
  }): { valid: boolean; error?: string } {
    const config = this.getContractAddresses();
    
    // Validate addresses
    if (!this.isWhitelistedAddress(params.bridgeAddress, 'bridge')) {
      return { valid: false, error: 'Invalid bridge address' };
    }
    
    if (!this.isWhitelistedAddress(params.tokenAddress, 'usdc')) {
      return { valid: false, error: 'Invalid token address' };
    }
    
    // Validate amount
    const amount = parseFloat(params.amount);
    const minAmount = parseFloat(config.minimumDepositAmount);
    const limits = this.getDepositRateLimits();
    const maxAmount = parseFloat(limits.maxAmountPerDeposit);
    
    if (isNaN(amount) || amount < minAmount) {
      return { valid: false, error: `Minimum deposit amount is ${minAmount} USDC` };
    }
    
    if (amount > maxAmount) {
      return { valid: false, error: `Maximum deposit amount is ${maxAmount} USDC` };
    }
    
    return { valid: true };
  }
}

export default ConfigurationService;