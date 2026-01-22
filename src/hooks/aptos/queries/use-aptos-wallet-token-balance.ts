import { useQuery } from "@tanstack/react-query";
import { aptosClient } from "@/constants/aptos";
import { useAuth } from "@/provider/auth-provider";

export const aptosWalletBalanceKeys = {
  all: ["aptosWalletBalance"] as const,
  token: (address?: string, tokenAddress?: string) =>
    [...aptosWalletBalanceKeys.all, address, tokenAddress] as const,
};

interface UseAptosWalletTokenBalanceParams {
  address?: string;
  tokenAddress?: string;
}

/**
 * Fetches actual token balance from user's Aptos wallet (not MoneyFi internal balance)
 * Uses Aptos SDK to query blockchain directly for fungible asset balance
 *
 * @description
 * This hook queries the Aptos blockchain for the user's actual wallet balance
 * for a specific token (USDC/USDT). This is different from MoneyFi's internal
 * balance which shows amounts deposited into the protocol.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useAptosWalletTokenBalance({
 *   address: "0x7e06...5e21",
 *   tokenAddress: APTOS_ADDRESS.USDC
 * });
 * // data.display = "4.32", data.balance = 4320000
 * ```
 */
export const useAptosWalletTokenBalance = ({
  address,
  tokenAddress,
}: UseAptosWalletTokenBalanceParams) => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: aptosWalletBalanceKeys.token(address, tokenAddress),
    queryFn: async () => {
      if (!address || !tokenAddress) {
        throw new Error("Address and token address are required");
      }

      try {
        // Query fungible asset balance from Aptos blockchain
        const coins = await aptosClient.getAccountCoinsData({
          accountAddress: address,
        });

        // Normalize target address for comparison (remove 0x, lowercase)
        const normalizedTarget = tokenAddress.toLowerCase().replace("0x", "");

        // Find the specific token by asset type
        const tokenCoin = coins.find((coin) => {
          // asset_type contains the full token address/type
          const assetType = coin.asset_type?.toLowerCase() || "";
          // Also check metadata.asset_type if available
          const metadataType =
            (coin as any).metadata?.asset_type?.toLowerCase() || "";

          return (
            assetType.includes(normalizedTarget) ||
            metadataType.includes(normalizedTarget)
          );
        });

        if (!tokenCoin) {
          return { balance: 0, display: "0.00" };
        }

        // amount is in smallest units (6 decimals for USDC/USDT)
        const rawBalance = Number(tokenCoin.amount || 0);
        return {
          balance: rawBalance,
          display: (rawBalance / 1e6).toFixed(2),
        };
      } catch (error) {
        console.error("Error fetching Aptos wallet token balance:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && address && tokenAddress),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
