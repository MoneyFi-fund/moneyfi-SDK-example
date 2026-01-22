import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useMoneyFiProvider, validateAuth } from ".";
import { moneyFiQueryKeys } from "./query-keys/moneyfi-query-keys";
import { REFETCH_CONFIG } from "./utils/use-delayed-refetch";

/**
 * Hook for fetching bridge transaction status
 * Uses TanStack Query for caching and automatic refetching
 *
 * @param txHash - The transaction hash to check status for
 * @param enabled - Optional flag to enable/disable the query (default: true)
 * @returns TanStack Query result with bridge status data
 *
 * @example
 * ```tsx
 * const { data: bridgeStatus, isLoading, error } = useGetBridgeStatusQuery(txHash);
 * ```
 */
export const useGetBridgeStatusQuery = (txHash?: string, enabled: boolean = true) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFi = useMoneyFiProvider();

  return useQuery({
    queryKey: moneyFiQueryKeys.bridgeStatus(txHash),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

      if (!txHash) {
        throw new Error("Transaction hash is required");
      }

      try {
        const status = await moneyFi.getBridgeStatus(txHash);
        return status;
      } catch (error) {
        console.error("Error fetching bridge status:", error);
        throw error;
      }
    },
    enabled: !!(isAuthenticated && user && txHash && enabled),
    staleTime: 0, // Always consider data stale to allow refetching
    gcTime: REFETCH_CONFIG.gcTime,
    retry: 3, // Retry up to 3 times for network issues
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchInterval: (query) => {
      // Stop refetching if status is "done" or "failed"
      const status = query.state.data as any;
      if (
        status === "done" ||
        status === "failed" ||
        status?.status === "done" ||
        status?.status === "failed" ||
        status?.status_transfer_fund === "done" ||
        status?.status_transfer_fund === "failed"
      ) {
        return false;
      }
      // Poll every 10 seconds for pending transactions
      return 10000;
    },
  });
};
