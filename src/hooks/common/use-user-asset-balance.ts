import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider } from "./providers/use-moneyfi-provider";
import { moneyFiQueryKeys } from "./query-keys/moneyfi-query-keys";

interface UseGetUserAssetBalanceParams {
  address?: string;
  chainId?: number;
  tokenAddress?: string;
}

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
