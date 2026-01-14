import { useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { moneyFiQueryKeys } from "../query-keys/moneyfi-query-keys";
import { BALANCE_REFETCH_CONFIG } from "@/hooks/aptos/queries/const";

export const REFETCH_CONFIG = {
  immediate: 0,
  delayed: 4000, // 4 seconds for blockchain confirmation
  staleTime: 30_000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
} as const;

interface DelayedRefetchOptions {
  immediate?: boolean;
  delayed?: boolean;
}

/**
 * Generic delayed refetch hook for balance updates
 * Supports immediate optimistic updates + delayed blockchain confirmation
 */
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