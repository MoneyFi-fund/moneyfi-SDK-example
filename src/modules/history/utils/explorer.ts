/**
 * Chain ID to explorer URL mapping
 * Uses numeric chain IDs: -1 for Aptos, EVM chain IDs for others
 */
const EXPLORER_URLS: Record<number, string> = {
  // Aptos
  [-1]: "https://explorer.aptoslabs.com/txn",
  1: "https://explorer.aptoslabs.com/txn", // Alternative Aptos chain ID

  // EVM chains
  42161: "https://arbiscan.io/tx",
  56: "https://bscscan.com/tx",
  8453: "https://basescan.org/tx",
  10: "https://optimistic.etherscan.io/tx",
  1116: "https://scan.coredao.org/tx",
};

/**
 * Chain ID to network display name mapping
 */
const NETWORK_NAMES: Record<number, string> = {
  [-1]: "Aptos",
  1: "Aptos",
  42161: "Arbitrum",
  56: "BSC",
  8453: "Base",
  10: "Optimism",
  1116: "Core",
};

/**
 * Get explorer URL for a transaction hash
 * @param chainId - Numeric chain ID (-1 for Aptos, 8453 for Base, etc.)
 * @param hash - Transaction hash
 */
export const getExplorerUrl = (
  chainId: number | string | undefined,
  hash: string
): string | null => {
  if (!hash) return null;

  const numericChainId = Number(chainId);
  if (isNaN(numericChainId)) return null;

  const baseUrl = EXPLORER_URLS[numericChainId];

  if (!baseUrl) {
    console.warn(`No explorer URL for chain ID: ${chainId}`);
    return null;
  }

  return `${baseUrl}/${hash}`;
};

/**
 * Check if chain ID is Aptos
 */
export const isAptosNetwork = (chainId: number | string | undefined): boolean => {
  const numericChainId = Number(chainId);
  return numericChainId === -1 || numericChainId === 1;
};

/**
 * Get network display name from chain ID
 */
export const getNetworkName = (chainId: number | string | undefined): string => {
  const numericChainId = Number(chainId);
  if (isNaN(numericChainId)) return String(chainId);
  return NETWORK_NAMES[numericChainId] ?? `Chain ${numericChainId}`;
};
