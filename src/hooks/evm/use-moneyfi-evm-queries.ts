// import { BALANCE_REFETCH_CONFIG } from './../use-moneyfi-queries';
import React, { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSendTransaction, useWriteContract, useSwitchChain } from "wagmi";
import { wagmiConfig } from "@/config/wagmi-config";
// import { MoneyFi, PayloadType } from "@mvstp3fn/moneyfi-ts-sdk";
import { MoneyFi, PayloadType } from "@moneyfi/ts-sdk"; 

import { useAuth } from "@/provider/auth-provider";
import {
  useMoneyFiProvider,
  validateAuth,
  REFETCH_CONFIG,
} from "../common";
import { moneyFiQueryKeys } from "../common/query-keys/moneyfi-query-keys";
import { abi as abiERC20 } from "../../contracts/ERC20Mock.json";

export const evmQueryKeys = {
  all: ["evm"] as const,
  balance: (chainId: string, address?: string) =>
    [...evmQueryKeys.all, "balance", chainId, address] as const,
  balanceRefreshing: (chainId: string, address?: string) =>
    [...evmQueryKeys.balance(chainId, address), "refreshing"] as const,
  supportedChains: () => [...evmQueryKeys.all, "supportedChains"] as const,
  supportedTokens: (chainId?: string) =>
    chainId
      ? [...evmQueryKeys.all, "supportedTokens", chainId]
      : [...evmQueryKeys.all, "supportedTokens"],
} as const;

export const useGetSupportedChains = () => {
  const moneyFi = useMoneyFiProvider();

  return useQuery({
    queryKey: evmQueryKeys.supportedChains(),
    queryFn: async () => {
      try {
        const supportedChainsData = await moneyFi.getSupportedChains();
        const evmChains = (supportedChainsData as any)?.evm || [];
        const chains = evmChains.map((name: string) => ({
          id: name,
          name,
          type: "evm",
        }));

        return chains;
      } catch (error) {
        console.error("Error fetching supported chains:", error);
        throw error;
      }
    },
    // staleTime: BALANCE_REFETCH_CONFIG.staleTime,
    // gcTime: BALANCE_REFETCH_CONFIG.gcTime,
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
    // staleTime: BALANCE_REFETCH_CONFIG.staleTime,
    // gcTime: BALANCE_REFETCH_CONFIG.gcTime,
    retry: 1,
  });
};

export const useDelayedBalanceRefetchEVM = (chainId: string) => {
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
      const queryKey = evmQueryKeys.balance(chainId, user?.address);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      try {
        if (options.immediate) {
          await queryClient.refetchQueries({
            queryKey,
            type: "active",
          });
        }

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
          }, 5000);
        }
      } catch (error) {
        console.error("Immediate balance refetch failed:", error);
      }
    },
    [queryClient, chainId, user?.address]
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return { triggerDelayedRefetch, cleanup };
};

interface EVMDepositMutationParams {
  chainId: string | number;
  tokenAddress: string;
  sender: string;
  amount?: number;
}

interface EVMWithdrawMutationParams {
  chainId: string | number;
  tokenAddress?: string;
  amount?: number;
  onStatusChange?: (status: string) => void;
}

export const useEVMDepositMutation = ({
  chainId,
  sender: userAddress,
}: EVMDepositMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { sendTransactionAsync } = useSendTransaction({ config: wagmiConfig });
  const { switchChainAsync } = useSwitchChain({ config: wagmiConfig });
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetchEVM(
    String(chainId)
  );
  const moneyFi = useMoneyFiProvider();
  const { writeContractAsync: evmApproveContract } = useWriteContract();
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
      validateAuth(isAuthenticated, user);

      const chainIdNum = Number(chainId) as 1 | 42161 | 8453 | 56;

      try {
        // Switch to the correct chain before executing transactions
        await switchChainAsync({ chainId: chainIdNum });

        // Get deposit transaction payload with dynamic chain_id
        const payload = await moneyFi.getDepositTxPayload({
          sender: userAddress,
          chain_id: chainIdNum,
          token_address: tokenAddress || `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`,
          amount: Number(Number(amount) * 1e6),
          target_chain: 0,
          type: PayloadType.Evm,
        });

        const targetTokenAddress = tokenAddress || `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`;

        // ERC20 approval transaction
        const approve = await evmApproveContract({
          address: targetTokenAddress as `0x${string}`,
          abi: abiERC20,
          functionName: "approve",
          args: [(payload as any).evm_contract_address, BigInt(Math.floor(Number(amount) * 10**6))],
          chainId: chainIdNum,
        });
        console.log("Approval transaction sent:", approve);

        // Send deposit transaction using wagmi
        const payloadData = (payload as any).tx;
        const targetAddress = (payload as any).evm_contract_address;

        const txHash = await sendTransactionAsync({
          data: payloadData.startsWith("0x")
            ? (payloadData as `0x${string}`)
            : (`0x${payloadData}` as `0x${string}`),
          to: targetAddress as `0x${string}`,
          chainId: chainIdNum,
        });

        return { hash: txHash };
      } catch (error) {
        console.error("Deposit transaction failed:", error);
        throw error;
      }
    },

    onSuccess: async () => {
      await triggerDelayedRefetch({
        immediate: true,
        delayed: true,
      });
    },

    onError: (error) => {
      console.error("Deposit mutation error:", error);
      cleanup();
    },

    retry: false,
  });
};

export const useEVMWithdrawMutation = ({
  chainId,
  tokenAddress,
  onStatusChange,
}: EVMWithdrawMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { sendTransactionAsync } = useSendTransaction({ config: wagmiConfig });
  const { switchChainAsync } = useSwitchChain({ config: wagmiConfig });
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetchEVM(
    String(chainId)
  );
  const moneyFi = useMoneyFiProvider();
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async ({
      amount,
      tokenAddress,
    }: {
      amount: number;
      tokenAddress: string;
    }) => {
      validateAuth(isAuthenticated, user);

      const chainIdNum = Number(chainId) as 1 | 42161 | 8453 | 56;

      try {
        // Request withdraw payload from MoneyFi
        const transformedPayload = {
          type: PayloadType.Evm,
          chain_id: chainIdNum,
          amount: Number(amount * 1e6),
          token_address: tokenAddress,
        };

        const response = await moneyFi.reqWithdraw(transformedPayload);
        const txData = response as any;
        const targetChainId = Number(txData.target_chain) as 1 | 42161 | 8453 | 56;

        // Switch to the target chain before executing the transaction
        await switchChainAsync({ chainId: targetChainId });

        const txHash = await sendTransactionAsync({
          data: txData.tx.startsWith("0x")
            ? (txData.tx as `0x${string}`)
            : (`0x${txData.tx}` as `0x${string}`),
          to: txData.evm_contract_address as `0x${string}`,
          chainId: targetChainId,
        });

        const pollWithdrawStatus = async (): Promise<any> => {
          const POLLING_INTERVAL = 10000; // 10 seconds interval
          const POLLING_TIMEOUT = 400000; // 6 minutes timeout
          const startTime = Date.now();
          let attempts = 0;
          const maxAttempts = Math.floor(POLLING_TIMEOUT / POLLING_INTERVAL);

          while (attempts < maxAttempts) {
            try {
              const statusResponse = await moneyFi.getWithdrawStatus(
                // @ts-ignore
                user.address
              );

              // Extract status string for UI display
              const currentStatus = typeof statusResponse === "string"
                ? statusResponse
                : (statusResponse as any)?.status || "polling";

              // Notify UI of current status
              onStatusChange?.(currentStatus);

              if (
                (statusResponse as any) === "done" ||
                (statusResponse as any)?.status === "done"
              ) {
                return { txHash, actualAmount: amount };
              }

              if (Date.now() - startTime > POLLING_TIMEOUT) {
                throw new Error(`Withdrawal status polling timed out after ${POLLING_TIMEOUT / 1000} seconds`);
              }

              attempts++;
              await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
            } catch (error) {
              console.error(`Polling attempt ${attempts + 1} failed:`, error);
              onStatusChange?.("retrying");
              attempts++;

              if (attempts >= maxAttempts) {
                throw new Error(`Withdrawal status polling failed after ${maxAttempts} attempts`);
              }

              await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
            }
          }

          throw new Error(`Withdrawal status polling timed out after ${POLLING_TIMEOUT / 1000} seconds`);
        };

        return await pollWithdrawStatus();
      } catch (error) {
        console.error("Withdraw process failed:", error);
        throw error;
      }
    },

    onSuccess: async () => {
      try {
        await triggerDelayedRefetch({
          immediate: true,
          delayed: true,
        });
      } catch (error) {
        console.error("Balance refetch failed:", error);
        throw error;
      }
    },

    onError: (error) => {
      console.error("Withdraw mutation error:", error);
      cleanup();
    },

    retry: false,
  });
};
