/**
 * Chain Configuration System
 * Centralized configuration for all supported chains
 * Clean, type-safe, and easily extensible
 */

import type { ChainConfig, TokenInfo } from '@/types/chain-adapter';

/**
 * Native token configurations
 */
export const NATIVE_TOKENS = {
  ETH: { symbol: 'ETH', decimals: 18, name: 'Ethereum' },
  BNB: { symbol: 'BNB', decimals: 18, name: 'BNB' },
  APT: { symbol: 'APT', decimals: 8, name: 'Aptos' },
  CORE: { symbol: 'CORE', decimals: 18, name: 'Core' },
} as const;

/**
 * Block explorer configurations
 */
export const BLOCK_EXPLORERS = {
  ETHEREUM: { name: 'Etherscan', url: 'https://etherscan.io' },
  ARBITRUM: { name: 'Arbiscan', url: 'https://arbiscan.io' },
  BASE: { name: 'Basescan', url: 'https://basescan.org' },
  BSC: { name: 'BscScan', url: 'https://bscscan.com' },
  CORE: { name: 'CoreScan', url: 'https://scan.coredao.org' },
  APTOS: { name: 'Aptos Explorer', url: 'https://explorer.aptoslabs.com' },
} as const;

/**
 * EVM chain configurations
 */
export const EVM_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    type: 'evm',
    chainId: 1,
    explorer: BLOCK_EXPLORERS.ETHEREUM,
    nativeToken: {
      ...NATIVE_TOKENS.ETH,
      address: '0x0000000000000000000000000000000000000000',
    },
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    type: 'evm',
    chainId: 42161,
    explorer: BLOCK_EXPLORERS.ARBITRUM,
    nativeToken: {
      ...NATIVE_TOKENS.ETH,
      address: '0x0000000000000000000000000000000000000000',
    },
  },
  base: {
    id: 'base',
    name: 'Base',
    type: 'evm',
    chainId: 8453,
    explorer: BLOCK_EXPLORERS.BASE,
    nativeToken: {
      ...NATIVE_TOKENS.ETH,
      address: '0x0000000000000000000000000000000000000000',
    },
  },
  bsc: {
    id: 'bsc',
    name: 'Binance Smart Chain',
    type: 'evm',
    chainId: 56,
    explorer: BLOCK_EXPLORERS.BSC,
    nativeToken: {
      ...NATIVE_TOKENS.BNB,
      address: '0x0000000000000000000000000000000000000000',
    },
  },
  core: {
    id: 'core',
    name: 'Core',
    type: 'evm',
    chainId: 1116,
    explorer: BLOCK_EXPLORERS.CORE,
    nativeToken: {
      ...NATIVE_TOKENS.CORE,
      address: '0x0000000000000000000000000000000000000000',
    },
  },
} as const;

/**
 * Aptos chain configuration
 */
export const APTOS_CHAINS: Record<string, ChainConfig> = {
  aptos: {
    id: 'aptos',
    name: 'Aptos',
    type: 'aptos',
    explorer: BLOCK_EXPLORERS.APTOS,
    nativeToken: {
      ...NATIVE_TOKENS.APT,
      address: '0x1',
    },
  },
} as const;

/**
 * Unified chain registry
 */
export const CHAIN_REGISTRY = {
  ...EVM_CHAINS,
  ...APTOS_CHAINS,
} as const;

/**
 * Chain ID mappings for quick lookups
 */
export const CHAIN_ID_MAP: Record<string, number> = {
  Mainnet: 1,
  Arbitrum: 42161,
  Base: 8453,
  BinanceSmartChain: 56,
  Core: 1116,
} as const;

export const CHAIN_NAME_MAP: Record<number, string> = {
  1: 'Mainnet',
  42161: 'Arbitrum',
  8453: 'Base',
  56: 'BinanceSmartChain',
  1116: 'Core',
} as const;

export const CHAIN_EXPLORERS: Record<number, { name: string; url: string }> = {
  1: { name: "Etherscan", url: "https://etherscan.io" },
  8453: { name: "Basescan", url: "https://basescan.org" },
  42161: { name: "Arbiscan", url: "https://arbiscan.io" },
  56: { name: "BscScan", url: "https://bscscan.com" },
  1116: { name: "CoreScan", url: "https://scan.coredao.org" },
} as const;

/**
 * Token configurations
 * This would typically come from the MoneyFi API
 */
export const TOKEN_CONFIGS: Record<string, TokenInfo> = {
  // Common stablecoins
  USDT: {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    chain: 'ethereum',
  },
  USDC: {
    address: '0xA0b86a33E6441b5e89e68C450C40F3b8c7A9b0FC',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    chain: 'ethereum',
  },
  // Additional tokens can be added here
} as const;

/**
 * Configuration validator
 */
export class ChainConfigValidator {
  /**
   * Validate chain configuration
   */
  static validateChainConfig(config: ChainConfig): void {
    if (!config.id) {
      throw new Error('Chain config must have an id');
    }
    if (!config.name) {
      throw new Error('Chain config must have a name');
    }
    if (!config.type) {
      throw new Error('Chain config must have a type');
    }
    if (config.type === 'evm' && !config.chainId) {
      throw new Error('EVM chain config must have a chainId');
    }
    if (!config.nativeToken) {
      throw new Error('Chain config must have native token info');
    }
  }

  /**
   * Validate token configuration
   */
  static validateTokenConfig(token: TokenInfo): void {
    if (!token.address) {
      throw new Error('Token must have an address');
    }
    if (!token.symbol) {
      throw new Error('Token must have a symbol');
    }
    if (!token.name) {
      throw new Error('Token must have a name');
    }
    if (typeof token.decimals !== 'number' || token.decimals < 0) {
      throw new Error('Token must have valid decimals');
    }
    if (!token.chain) {
      throw new Error('Token must specify a chain');
    }
  }
}

/**
 * Chain configuration utilities
 */
export class ChainConfigUtils {
  /**
   * Get chain configuration by ID
   */
  static getChainById(id: string): ChainConfig | null {
    return CHAIN_REGISTRY[id as keyof typeof CHAIN_REGISTRY] || null;
  }

  /**
   * Get chain configuration by chain ID (for EVM)
   */
  static getChainByChainId(chainId: number): ChainConfig | null {
    return Object.values(CHAIN_REGISTRY).find(
      (config) => config.type === 'evm' && config.chainId === chainId
    ) || null;
  }

  /**
   * Get all EVM chains
   */
  static getEVMChains(): ChainConfig[] {
    return Object.values(CHAIN_REGISTRY).filter(
      (config) => config.type === 'evm'
    );
  }

  /**
   * Get all Aptos chains
   */
  static getAptosChains(): ChainConfig[] {
    return Object.values(CHAIN_REGISTRY).filter(
      (config) => config.type === 'aptos'
    );
  }

  /**
   * Get supported chains for MoneyFi
   */
  static getSupportedChains(): { evm: string[]; aptos: string[] } {
    const evmChains = Object.values(EVM_CHAINS).map(config => config.name);
    const aptosChains = Object.values(APTOS_CHAINS).map(config => config.name);

    return {
      evm: evmChains,
      aptos: aptosChains,
    };
  }

  /**
   * Get explorer URL for a transaction
   */
  static getExplorerUrl(chainId: number, txHash: string): string | null {
    const chain = this.getChainByChainId(chainId);
    if (!chain?.explorer) {
      console.warn(`No explorer configured for chain ID: ${chainId}`);
      return null;
    }
    return `${chain.explorer.url}/tx/${txHash}`;
  }

  /**
   * Get explorer URL for an address
   */
  static getAddressExplorerUrl(chainId: number, address: string): string | null {
    const chain = this.getChainByChainId(chainId);
    if (!chain?.explorer) {
      return null;
    }
    const path = chain.type === 'aptos' ? 'account' : 'address';
    return `${chain.explorer.url}/${path}/${address}`;
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: string | bigint, decimals: number): string {
    const value = typeof amount === 'bigint' ? amount : BigInt(amount);
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fractional = value % divisor;

    if (fractional === 0n) {
      return whole.toString();
    }

    const fractionalStr = fractional.toString().padStart(decimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    return `${whole}.${trimmedFractional}`;
  }

  /**
   * Parse amount to smallest unit
   */
  static parseAmount(amount: string, decimals: number): bigint {
    const [whole, fractional = ''] = amount.split('.');
    const wholeBigInt = BigInt(whole);
    const fractionalBigInt = BigInt(fractional.padEnd(decimals, '0').slice(0, decimals));
    const multiplier = BigInt(10 ** decimals);

    return wholeBigInt * multiplier + fractionalBigInt;
  }
}

/**
 * Default export for convenience
 */
export default {
  CHAIN_REGISTRY,
  EVM_CHAINS,
  APTOS_CHAINS,
  CHAIN_ID_MAP,
  CHAIN_NAME_MAP,
  CHAIN_EXPLORERS,
  NATIVE_TOKENS,
  BLOCK_EXPLORERS,
  ChainConfigValidator,
  ChainConfigUtils,
};