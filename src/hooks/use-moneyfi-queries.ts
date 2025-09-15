import React, { useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useWallet,
} from "@aptos-labs/wallet-adapter-react";
import { MoneyFiAptos } from "testquynx";
import { useAuth } from "@/provider/auth-provider";
import {
  Deserializer,
  RawTransaction,
  SimpleTransaction,
} from "@aptos-labs/ts-sdk";

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

interface DepositMutationParams {
  tokenAddress: string;
  sender: string;
  amount: BigInt;
}

export const useDepositMutation = ({
  tokenAddress,
  sender: userAddress,
  amount,
}: DepositMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const {
    signTransaction,
    submitTransaction,
  } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();
  const moneyFiAptos = new MoneyFiAptos();
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

      const payload = await moneyFiAptos.getDepositTxPayload(
        tokenAddress,
        userAddress,
        amountInSmallestUnit
      );

      const de = new Deserializer(payload);
      const depositTx = RawTransaction.deserialize(de);
      const depoistTxSimple = new SimpleTransaction(depositTx)

      const submitTx = await signTransaction({
        transactionOrPayload: depoistTxSimple,
      });
      const rst = await submitTransaction({
        transaction: depoistTxSimple,
        senderAuthenticator: submitTx.authenticator,
      });
      
      return rst;
    },

    onSuccess: async (data) => {
      console.log("Deposit transaction successful:", data);

      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });
    },
    onError: (error) => {
      console.error("Deposit transaction failed:", error);
      cleanup();
    },
    retry: false,
  });
};
