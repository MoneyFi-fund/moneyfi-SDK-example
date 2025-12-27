/**
 * Token Configuration
 * Maps token addresses to their symbols and metadata
 * Based on moneyFi-dapp token configurations
 */

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

/**
 * Aptos Token Addresses (chain_id: -1 or 1)
 */
export const APTOS_TOKENS: Record<string, TokenConfig> = {
  "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b",
  },
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b",
  },
  "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2": {
    symbol: "USD1",
    name: "USD1",
    decimals: 6,
    address: "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2",
  },
};

/**
 * Base Token Addresses (chain_id: 8453)
 */
export const BASE_TOKENS: Record<string, TokenConfig> = {
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  },
  "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
  },
};

/**
 * Arbitrum Token Addresses (chain_id: 42161)
 */
export const ARBITRUM_TOKENS: Record<string, TokenConfig> = {
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  },
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  },
};

/**
 * BSC Token Addresses (chain_id: 56)
 */
export const BSC_TOKENS: Record<string, TokenConfig> = {
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 18,
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  },
  "0x55d398326f99059ff775485246999027b3197955": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    address: "0x55d398326f99059ff775485246999027b3197955",
  },
};

/**
 * Optimism Token Addresses (chain_id: 10)
 */
export const OPTIMISM_TOKENS: Record<string, TokenConfig> = {
  "0x0b2c639c533813f4aa9d7837caf62653d097ff85": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  },
  "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
  },
};

/**
 * Core Token Addresses (chain_id: 1116)
 */
export const CORE_TOKENS: Record<string, TokenConfig> = {
  "0xa4151b2b3e269645181dccf2d426ce75fcbdeca9": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xa4151b2b3e269645181dccf2d426ce75fcbdeca9",
  },
  "0x900101d06a7426441ae63e9ab3b9b0f63be145f1": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0x900101d06a7426441ae63e9ab3b9b0f63be145f1",
  },
};

/**
 * Ethereum Token Addresses (chain_id: 1 for Ethereum mainnet)
 */
export const ETHEREUM_TOKENS: Record<string, TokenConfig> = {
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  "0xdac17f958d2ee523a2206206994597c13d831ec7": {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 6,
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
};

/**
 * Chain ID to Token Map
 */
export const CHAIN_TOKENS: Record<number, Record<string, TokenConfig>> = {
  [-1]: APTOS_TOKENS, // Aptos
  1: APTOS_TOKENS, // Alternative Aptos chain ID
  8453: BASE_TOKENS,
  42161: ARBITRUM_TOKENS,
  56: BSC_TOKENS,
  10: OPTIMISM_TOKENS,
  1116: CORE_TOKENS,
};

/**
 * Get token config by chain ID and token address
 */
export function getTokenByAddress(
  chainId: number,
  tokenAddress: string
): TokenConfig | null {
  const chainTokens = CHAIN_TOKENS[chainId];
  if (!chainTokens) return null;

  const normalizedAddress = tokenAddress.toLowerCase();
  return chainTokens[normalizedAddress] ?? null;
}

/**
 * Get token symbol by chain ID and token address
 * Falls back to TOKEN_SYMBOL_MAP if chain-specific lookup fails
 */
export function getTokenSymbol(
  chainId: number | undefined,
  tokenAddress: string | undefined
): string {
  if (!tokenAddress) return "USDC"; // Default

  const normalizedAddress = tokenAddress.toLowerCase();

  // Try chain-specific lookup first
  if (chainId !== undefined) {
    const token = getTokenByAddress(chainId, tokenAddress);
    if (token) return token.symbol;
  }

  // Fallback to unified token map (cross-chain lookup)
  const symbol = TOKEN_SYMBOL_MAP[normalizedAddress];
  if (symbol) return symbol;

  // If it looks like a known symbol already, return it
  const knownSymbols = ["USDC", "USDT", "USD1", "APT", "ETH", "BNB", "CORE"];
  if (knownSymbols.includes(tokenAddress.toUpperCase())) {
    return tokenAddress.toUpperCase();
  }

  return tokenAddress;
}

/**
 * Get token decimals by chain ID and token address
 * Returns 6 as default (common for stablecoins)
 */
export function getTokenDecimals(
  chainId: number | undefined,
  tokenAddress: string | undefined
): number {
  if (!tokenAddress || !chainId) return 6;

  const token = getTokenByAddress(chainId, tokenAddress);
  return token?.decimals ?? 6;
}

/**
 * Unified token map for quick symbol lookup
 * Maps lowercase address -> symbol (for cases where chain_id is not available)
 */
export const TOKEN_SYMBOL_MAP: Record<string, string> = {
  // Placeholder/generic token address (used by some chains as default USDC)
  "0x0000000000000000000000000000000000000001": "USDC",
  // Aptos
  "0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b": "USDC",
  "0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b": "USDT",
  "0x05fabd1b12e39967a3c24e91b7b8f67719a6dacee74f3c8b9fb7d93e855437d2": "USD1",
  // Base
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": "USDC",
  "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd": "USDT",
  // Arbitrum
  "0xaf88d065e77c8cc2239327c5edb3a432268e5831": "USDC",
  "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9": "USDT",
  // BSC
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": "USDC",
  "0x55d398326f99059ff775485246999027b3197955": "USDT",
  // Optimism
  "0x0b2c639c533813f4aa9d7837caf62653d097ff85": "USDC",
  "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58": "USDT",
  // Core
  "0xa4151b2b3e269645181dccf2d426ce75fcbdeca9": "USDC",
  "0x900101d06a7426441ae63e9ab3b9b0f63be145f1": "USDT",
  // Ethereum
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
};

/**
 * Resolve token symbol from address (fallback without chain_id)
 */
export function resolveTokenSymbol(tokenAddressOrSymbol: string): string {
  if (!tokenAddressOrSymbol) return "USDC";

  // If it's already a known symbol, return it
  const knownSymbols = ["USDC", "USDT", "USD1", "APT", "ETH", "BNB", "CORE"];
  if (knownSymbols.includes(tokenAddressOrSymbol.toUpperCase())) {
    return tokenAddressOrSymbol.toUpperCase();
  }

  // Try to look up by address
  const normalized = tokenAddressOrSymbol.toLowerCase();
  return TOKEN_SYMBOL_MAP[normalized] ?? tokenAddressOrSymbol;
}
