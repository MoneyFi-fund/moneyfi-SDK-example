import React, { useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MoneyFi } from "quy-ts-sdk";
// import { MoneyFi } from "@moneyfi/ts-sdk";
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
  supportedChains: () => [...moneyFiQueryKeys.all, "supportedChains"] as const,
  supportedTokens: () => [...moneyFiQueryKeys.all, "supportedTokens"] as const,
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
  const { signTransaction, submitTransaction } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
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

      const payload = await moneyFiAptos.getDepositTxPayload({
        sender: userAddress,
        chain_id: -1,
        token_address: tokenAddress,
        amount: amountInSmallestUnit,
      });

      // Decode base64 string to bytes
      const binaryString = atob(payload.tx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const de = new Deserializer(bytes);
      const depositTx = RawTransaction.deserialize(de);
      const depoistTxSimple = new SimpleTransaction(depositTx);
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

export const useWithdrawMutation = (tokenAddress: string, amount: BigInt) => {
  const { isAuthenticated, user } = useAuth();
  const { account: aptosAccount } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
  const { signTransaction, submitTransaction } = useWallet();

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async ({
      address,
      payload,
    }: {
      address: string;
      payload: {
        encoded_signature: string;
        encoded_pubkey: string;
        full_message: string;
      };
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!aptosAccount) {
        throw new Error("Wallet account not connected");
      }
      
      // Transform the payload to match ReqWithdrawPayload structure
      const transformedPayload = {
        signature: payload.encoded_signature,
        pubkey: payload.encoded_pubkey,
        message: payload.full_message,
      };
      await moneyFiAptos.reqWithdraw(
        address,
        transformedPayload
      );

      // Poll for withdraw status until it's done
      const pollWithdrawStatus = async (): Promise<any> => {
        while (true) {
          const statusResponse = await moneyFiAptos.getWithdrawStatus(
            user.address
          );

          if (
            (statusResponse as any) === "done" ||
            (statusResponse as any)?.status === "done"
          ) {
            const txPayload = await moneyFiAptos.getWithdrawTxPayload({
              sender: user.address,
              chain_id: -1,
              token_address: tokenAddress,
              amount: amount as bigint,
            });

            return { txPayload };
          }

          // Wait 3 seconds before checking again
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      };

      return await pollWithdrawStatus();
    },
    onSuccess: async (data) => {
      const { txPayload } = data;

      // Decode base64 string to bytes
      const binaryString = atob(txPayload.tx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const de = new Deserializer(bytes);
      const withdrawTx = RawTransaction.deserialize(de);
      const withdrawTxSimple = new SimpleTransaction(withdrawTx);
      
      const submitTx = await signTransaction({
        transactionOrPayload: withdrawTxSimple,
      });
      const rst = await submitTransaction({
        transaction: withdrawTxSimple,
        senderAuthenticator: submitTx.authenticator,
      });

      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });

      return rst;
    },
    onError: (error) => {
      console.error("Withdraw transaction failed:", error);
      cleanup();
    },
    retry: false, // Don't retry mutations automatically
  });
};

export const useGetSupportedChains = () => {
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
  
  return useQuery({
    queryKey: moneyFiQueryKeys.supportedChains(),
    queryFn: async () => {
      try {
        const supportedChains = await moneyFiAptos.getSupportedChains();
        return supportedChains;
      } catch (error) {
        console.error("Error fetching supported chains:", error);
        throw error;
      }
    },
    staleTime: BALANCE_REFETCH_CONFIG.staleTime,
    gcTime: BALANCE_REFETCH_CONFIG.gcTime,
    retry: 1,
  });
};

export const useGetSupportedTokens = () => {
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
  
  return useQuery({
    queryKey: moneyFiQueryKeys.supportedTokens(),
    queryFn: async () => {
      try {
        const supportedTokens = await moneyFiAptos.getSupportedTokens();
        return supportedTokens;
      } catch (error) {
        console.error("Error fetching supported tokens:", error);
        throw error;
      }
    },
    staleTime: BALANCE_REFETCH_CONFIG.staleTime,
    gcTime: BALANCE_REFETCH_CONFIG.gcTime,
    retry: 1,
  });
};