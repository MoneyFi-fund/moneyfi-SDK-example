// import { BALANCE_REFETCH_CONFIG } from './../use-moneyfi-queries';
import React, { useCallback, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSendTransaction, useWriteContract } from "wagmi";
import { wagmiConfig } from "@/config/wagmi-config";
import { MoneyFi, PayloadType } from "moneyfi-ts-sdk";
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
}

export const useEVMDepositMutation = ({
  chainId,
  sender: userAddress,
}: EVMDepositMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { sendTransactionAsync } = useSendTransaction({ config: wagmiConfig });
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

      // if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      //   throw new Error("Please enter a valid amount");
      // }


      try {
        // Get deposit transaction payload with dynamic chain_id

        const payload = await moneyFi.getDepositTxPayload({
          sender: userAddress,
          chain_id: Number(chainId),
          token_address: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`,
          amount: Number(Number(amount) * 1e6),
          target_chain: 0,
          type: PayloadType.Evm,
        });

        // ERC20 approval transaction
        await evmApproveContract({
          address: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` as `0x${string}`,
          abi: abiERC20,
          functionName: "approve",
          args: [(payload as any).evm_contract_address, BigInt(Math.floor(Number(amount) * 10**6))],
        });

        // Send transaction using wagmi
        const chainIdNum = Number(chainId) as 1 | 42161 | 8453 | 56;
        const payloadData = (payload as any).tx;
        const targetAddress = (payload as any).evm_contract_address;

        const txHash = await sendTransactionAsync({
          data: payloadData.startsWith("0x")
            ? (payloadData as `0x${string}`)
            : (`0x${payloadData}` as `0x${string}`),
          to: targetAddress as `0x${string}`, // Target contract
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
}: EVMWithdrawMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { sendTransactionAsync } = useSendTransaction({ config: wagmiConfig });
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetchEVM(
    String(chainId)
  );
  const moneyFi = useMoneyFiProvider();
  const tokenAddress = `0x00000000000000000000000000000000000000000`; // Use native token for withdraw
  React.useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return useMutation({
    mutationFn: async ({
      amount,
    }: {
      amount: number;
    }) => {
      validateAuth(isAuthenticated, user);

      if (!tokenAddress) {
        throw new Error("Token address is required");
      }

      try {
        const transformedPayload = {
          type: PayloadType.Evm,
          chain_id: Number(chainId),
          // chain_id: 0,
          amount: Number(amount * 1e6)
        };

        const response = await moneyFi.reqWithdraw(transformedPayload);

        const txData = response as any;
        const txHash = await sendTransactionAsync({
          data: txData.tx.startsWith("0x")
            ? (txData.tx as `0x${string}`)
            : (`0x${txData.tx}` as `0x${string}`),
          to: txData.evm_contract_address as `0x${string}`,
          chainId: Number(txData.target_chain) as 1 | 42161 | 8453 | 56,
        });

        const pollWithdrawStatus = async (): Promise<any> => {
          const POLLING_TIMEOUT = 30000; // 30 seconds timeout
          const POLLING_INTERVAL = 3000; // 3 seconds interval
          const startTime = Date.now();
          let attempts = 0;
          const maxAttempts = Math.floor(POLLING_TIMEOUT / POLLING_INTERVAL);

          while (attempts < maxAttempts) {
            try {
              const statusResponse = await moneyFi.getWithdrawStatus(
                user.address
              );

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
