import React, { useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useWallet,
  type InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { MoneyFiAptos } from "aptosmoneyfimockupupgrade";
import { useAuth } from "@/provider/auth-provider";

// Configuration for delayed refetch timing
export const BALANCE_REFETCH_CONFIG = {
  immediate: 0, // Immediate optimistic refetch
  delayed: 4000, // 4 seconds delayed refetch for blockchain confirmation
  staleTime: 30_000, // 30 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
} as const;

export const moneyFiQueryKeys = {
  all: ["moneyfi"] as const,
  balance: (address?: string) =>
    [...moneyFiQueryKeys.all, "balance", address] as const,
  balanceRefreshing: (address?: string) =>
    [...moneyFiQueryKeys.balance(address), "refreshing"] as const,
};

// Custom hook for handling delayed balance refetch with proper cleanup
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
              console.log(
                "Executing delayed balance refetch for blockchain confirmation..."
              );
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

// Hook to track if we're in a transaction confirmation window
export const useTransactionConfirmationStatus = () => {
  const { data: balanceData, dataUpdatedAt, isFetching } = useBalanceQuery();
  const [isInConfirmationWindow, setIsInConfirmationWindow] =
    React.useState(false);

  React.useEffect(() => {
    if (dataUpdatedAt && !isFetching) {
      const timeSinceUpdate = Date.now() - dataUpdatedAt;

      // We're in confirmation window if the last update was recent
      // and within the delayed refetch period
      if (timeSinceUpdate < BALANCE_REFETCH_CONFIG.delayed + 1000) {
        setIsInConfirmationWindow(true);

        const timeout = setTimeout(() => {
          setIsInConfirmationWindow(false);
        }, BALANCE_REFETCH_CONFIG.delayed - timeSinceUpdate + 1000);

        return () => clearTimeout(timeout);
      } else {
        setIsInConfirmationWindow(false);
      }
    }
  }, [dataUpdatedAt, isFetching]);

  return {
    isInConfirmationWindow,
    balanceData,
    lastUpdateTime: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
  };
};

export const useBalanceQuery = () => {
  const { isAuthenticated, user } = useAuth();

  return useQuery({
    queryKey: moneyFiQueryKeys.balance(user?.address),
    queryFn: async () => {
      if (!user?.address) {
        // Return default balance instead of throwing error
        return { usdt: 0, usdc: 0 };
      }

      try {
        const moneyFiAptos = new MoneyFiAptos();
        const withdrawableAmount = await moneyFiAptos.previewWithdraw(
          user.address
        );

        // Ensure we have valid data structure
        if (
          !withdrawableAmount ||
          !withdrawableAmount[0] ||
          withdrawableAmount[0].length < 2
        ) {
          return { usdt: 0, usdc: 0 };
        }
        console.log("Fetched withdrawable amount:", withdrawableAmount);
        return {
          usdt: withdrawableAmount[0][0] / 1_000_000,
          usdc: withdrawableAmount[0][1] / 1_000_000,
        };
      } catch (error) {
        console.error("Error fetching balance:", error);
        // Return default balance on error instead of throwing
        return { usdt: 0, usdc: 0 };
      }
    },
    enabled: isAuthenticated && !!user?.address,
    staleTime: BALANCE_REFETCH_CONFIG.staleTime,
    gcTime: BALANCE_REFETCH_CONFIG.gcTime,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes("4")) {
        return false;
      }
      return failureCount < 2; // Reduce retry count
    },
  });
};

export const useDepositMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();
  const moneyFiAptos = new MoneyFiAptos();

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async ({
      amount,
      tokenAddress,
    }: {
      amount: string;
      tokenAddress: string;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const amountInSmallestUnit = BigInt(
        Math.floor(Number(amount) * 1_000_000)
      );

      const payload = await moneyFiAptos.getDepositTxPayload(tokenAddress);
      const transaction: InputTransactionData = {
        data: {
          function: payload.function as `${string}::${string}::${string}`,
          functionArguments: payload.functionArguments,
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: async (data) => {
      console.log("Deposit transaction successful:", data.hash);

      // Use the optimized refetch mechanism
      // Immediate optimistic refetch + delayed refetch for blockchain confirmation
      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });
    },
    onError: (error) => {
      console.error("Deposit transaction failed:", error);
      // Clean up any pending timeouts on error
      cleanup();
    },
    retry: false, // Don't retry mutations automatically
  });
};

export const useWithdrawMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async () => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      const moneyFiAptos = new MoneyFiAptos();
      const payload = await moneyFiAptos.getWithdrawTxPayload();

      const transaction: InputTransactionData = {
        data: {
          function: payload.function as `${string}::${string}::${string}`,
          functionArguments: payload.functionArguments,
        },
      };

      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: async (data) => {
      console.log("Withdraw transaction successful:", data.hash);

      // Use the optimized refetch mechanism
      // Immediate optimistic refetch + delayed refetch for blockchain confirmation
      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });
    },
    onError: (error) => {
      console.error("Withdraw transaction failed:", error);
      // Clean up any pending timeouts on error
      cleanup();
    },
    retry: false, // Don't retry mutations automatically
  });
};
