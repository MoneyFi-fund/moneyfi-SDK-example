import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import {
  useMoneyFiProvider,
  validateAuth,
  moneyFiQueryKeys,
  REFETCH_CONFIG,
} from "../../common";
import { useCallback, useRef } from "react";
import { BALANCE_REFETCH_CONFIG } from "./const";

/**
 * Query hook for fetching user balance from MoneyFi
 */
export const useBalanceQuery = (address?: string) => {
  const { isAuthenticated, user } = useAuth();
  const moneyFiAptos = useMoneyFiProvider();

  return useQuery({
    queryKey: moneyFiQueryKeys.balance(address),
    queryFn: async () => {
      validateAuth(isAuthenticated, user);

      if (!address) {
        throw new Error("Address is required");
      }

      const balance = await moneyFiAptos.getBalance({ address });
      return balance;
    },
    enabled: !!(isAuthenticated && user && address),
    staleTime: REFETCH_CONFIG.staleTime,
    gcTime: REFETCH_CONFIG.gcTime,
    retry: 3,
  });
};

export const useDelayedBalanceRefetch = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // @ts-ignore
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDelayedRefetch = useCallback(
    async (
      options: { immediate?: boolean; delayed?: boolean } = {
        immediate: true,
        delayed: true,
      }
    ) => {
      const queryKey = moneyFiQueryKeys.balance(user?.address);

      // Clear any existing timeout to prevent multiple delayed refetches
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try {
        // Immediate optimistic refetch
        if (options.immediate) {
          await queryClient.refetchQueries({
            queryKey,
            type: "active",
          });
        }

        // Schedule delayed refetch for blockchain confirmation
        if (options.delayed) {
          timeoutRef.current = setTimeout(async () => {
            try {
              await queryClient.refetchQueries({
                queryKey,
                type: "active",
              });
            } catch (error) {
              console.error("Delayed balance refetch failed:", error);
            } finally {
              timeoutRef.current = null;
            }
          }, BALANCE_REFETCH_CONFIG.delayed);
        }
      } catch (error) {
        console.error("Immediate balance refetch failed:", error);
      }
    },
    [queryClient, user?.address]
  );

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { triggerDelayedRefetch, cleanup };
};