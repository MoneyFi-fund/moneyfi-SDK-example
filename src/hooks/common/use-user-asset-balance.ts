import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider } from "./providers/use-moneyfi-provider";
import { moneyFiQueryKeys } from "./query-keys/moneyfi-query-keys";

/**
 * Parameters for the useGetUserAssetBalance hook
 * @param address - User's wallet address (EVM or Aptos)
 * @param chainId - Chain ID (e.g., 42161 for Arbitrum)
 * @param tokenAddress - Optional token contract address (e.g., USDC address)
 */
interface UseGetUserAssetBalanceParams {
  address?: string;
  chainId?: number;
  tokenAddress?: string;
}

/**
 * Fetches user's asset balance from MoneyFi SDK
 *
 * @description
 * React Query hook that fetches a user's token balance for a specific chain.
 * Uses MoneyFi SDK's getUserAssetBalance API.
 *
 * **Important**: SDK returns balance as a float in display units (e.g., 0.832372),
 * NOT as an integer in smallest units. No conversion needed.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useGetUserAssetBalance({
 *   address: "0x123...",
 *   chainId: 42161, // Arbitrum
 *   tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831" // USDC
 * });
 *
 * // data.balance is a float like 0.832372 (already in display units)
 * const displayBalance = data?.balance?.toFixed(2); // "0.83"
 * ```
 *
 * @returns React Query result with balance data
 * - data.balance: number (float in display units, e.g., 0.832372)
 * - isLoading: boolean
 * - error: Error | null
 * - refetch: () => void
 */
export const useGetUserAssetBalance = ({
  address,
  chainId,
  tokenAddress,
}: UseGetUserAssetBalanceParams) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFi = useMoneyFiProvider();

  return useQuery({
    queryKey: moneyFiQueryKeys.userAssetBalance(address, chainId, tokenAddress),
    queryFn: async () => {
      if (!isAuthenticated || !user || !address || !chainId) {
        throw new Error("Missing required parameters");
      }
      const balance = await moneyFi.getUserAssetBalance({
        sender: address,
        chain_id: chainId,
        token: tokenAddress,
      });
      return balance;
    },
    enabled: !!(isAuthenticated && user && address && chainId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
