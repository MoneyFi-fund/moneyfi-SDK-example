import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import {
  useMoneyFiProvider,
  validateAuth,
  moneyFiQueryKeys,
  REFETCH_CONFIG,
} from "../../common";

/**
 * Query hook for fetching wallet account assets
 */
export const useWalletAmountQuery = (address: string | null) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: moneyFiQueryKeys.walletAmount(address || undefined),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

      if (!address) {
        throw new Error("Address is required");
      }

      const walletAmount = await moneyFiAptos.getWalletAccountAssets({
        sender: address,
      });
      return walletAmount;
    },
    enabled: !!(isAuthenticated && user && address),
    staleTime: REFETCH_CONFIG.staleTime,
    gcTime: REFETCH_CONFIG.gcTime,
    retry: 3,
  });
};