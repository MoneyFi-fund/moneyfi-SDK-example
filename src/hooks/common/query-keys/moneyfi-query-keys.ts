/**
 * Query key factory for MoneyFi-related queries
 * Provides hierarchical cache management
 */
export const moneyFiQueryKeys = {
  all: ["moneyfi"] as const,

  // Balance queries
  balance: (address?: string) =>
    [...moneyFiQueryKeys.all, "balance", address] as const,
  balanceRefreshing: (address?: string) =>
    [...moneyFiQueryKeys.balance(address), "refreshing"] as const,
  walletAmount: (address?: string) =>
    [...moneyFiQueryKeys.all, "walletAmount", address] as const,

  // Chain & token queries
  supportedChains: () =>
    [...moneyFiQueryKeys.all, "supportedChains"] as const,
  supportedTokens: (chainId?: number) =>
    [...moneyFiQueryKeys.all, "supportedTokens", chainId] as const,

  // User queries
  user: (address?: string) =>
    [...moneyFiQueryKeys.all, "user", address] as const,
  userProfile: () =>
    [...moneyFiQueryKeys.all, "userProfile"] as const,

  // Transaction queries
  transactions: (address?: string) =>
    [...moneyFiQueryKeys.all, "transactions", address] as const,
  withdrawStatus: (address?: string) =>
    [...moneyFiQueryKeys.all, "withdrawStatus", address] as const,
  bridgeStatus: (txHash?: string) =>
    [...moneyFiQueryKeys.all, "bridgeStatus", txHash] as const,
  userAssetAllocation: (address?: string) =>
    [...moneyFiQueryKeys.all, "userAssetAllocation", address] as const,
} as const;