import { CHAIN_EXPLORERS } from "@/config/chains";

export const getExplorerUrl = (chainId: number, txHash: string): string | null => {
  const explorer = CHAIN_EXPLORERS[chainId];
  if (!explorer) {
    console.warn(`No explorer configured for chain ID: ${chainId}`);
    return null;
  }
  return `${explorer.url}/tx/${txHash}`;
};
