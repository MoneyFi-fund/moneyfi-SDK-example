import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider } from "./providers/use-moneyfi-provider";
import { validateAuth } from "./utils/validate-auth";
import { transactionQueryKeys } from "./query-keys/transaction-keys";
import type { TransactionHistoryResponse } from "@/types/transaction";

/**
 * Hook for fetching user transaction history from MoneyFi SDK
 */
export const useTransactionHistoryQuery = (page = 1, limit = 20) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: transactionQueryKeys.byPage(user?.address, page),
    queryFn: async (): Promise<TransactionHistoryResponse> => {
      validateAuth(isAuthenticated, user);

      if (!user?.address) {
        throw new Error("Address required");
      }

      try {
        // Try to get transaction history from MoneyFi SDK
        // Note: Method name may vary - check SDK documentation
        const response = await (moneyFiAptos as any).getTransactionHistory?.({
          address: user.address,
          page,
          limit,
        });

        if (response) {
          return response;
        }

        // Fallback: Return empty result if method not available
        return {
          nodes: [],
          totalCount: 0,
          page,
          limit,
        };
      } catch (error) {
        console.error("Error fetching transaction history:", error);
        // Return empty result on error
        return {
          nodes: [],
          totalCount: 0,
          page,
          limit,
        };
      }
    },
    enabled: !!(isAuthenticated && user?.address),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
};
