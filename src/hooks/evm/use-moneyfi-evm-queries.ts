import React, { useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { MoneyFi } from "@moneyfi/ts-sdk";
import { useAuth } from "@/provider/auth-provider";
import { BALANCE_REFETCH_CONFIG } from "../use-moneyfi-queries";

// Chain name to chain ID mapping for EVM networks
export const CHAIN_ID_MAP: Record<string, number> = {
  Base: 8453,
  Arbitrum: 42161,
  BinanceSmartChain: 56,
  Mainnet: 1,
  Core: 1116,
} as const;

// Reverse mapping: chain ID to chain name for token filtering
export const CHAIN_NAME_MAP: Record<number, string> = {
  8453: "Base",
  42161: "Arbitrum",
  56: "BinanceSmartChain",
  1: "Mainnet",
  1116: "Core",
} as const;

// EVM-specific query keys with chain support
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

/**
 * Hook to fetch supported EVM chains only
 * Filters out Aptos chain to show only EVM networks
 */
export const useGetSupportedChains = () => {
  const moneyFi = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useQuery({
    queryKey: evmQueryKeys.supportedChains(),
    queryFn: async () => {
      try {
        const supportedChainsData = await moneyFi.getSupportedChains();
        console.log("Raw supported chains:", supportedChainsData);

        // Transform EVM chain names to chain objects
        // Expected input: { evm: ["Base", "Arbitrum", ...], aptos: "Aptos" }
        // Only return EVM chains, exclude Aptos
        const evmChains = (supportedChainsData as any)?.evm || [];

        const chains = evmChains.map((name: string) => ({
          id: name,
          name,
          type: "evm",
        }));

        console.log("Transformed EVM chains:", chains);
        return chains;
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

/**
 * Hook to fetch supported tokens filtered by chain ID
 * Accepts chain ID (number), converts to chain name, and filters tokens
 * Returns array of tokens for the selected chain with address, symbol, and decimals
 */
export const useGetSupportedTokens = (chainId?: number | string) => {
  const moneyFi = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useQuery({
    queryKey: evmQueryKeys.supportedTokens(String(chainId)),
    queryFn: async () => {
      try {
        const allTokens = await moneyFi.getSupportedTokens();
        console.log("All supported tokens fetched:", allTokens);

        // If no chainId provided, return empty array
        if (!chainId) {
          return [];
        }

        // Convert chain ID to chain name for filtering
        // If chainId is already a string (chain name), use it directly
        let chainName: string;
        if (typeof chainId === "number") {
          chainName = CHAIN_NAME_MAP[chainId] || "";
        } else {
          chainName = chainId;
        }

        if (!chainName) {
          console.warn(`Unknown chain ID: ${chainId}`);
          return [];
        }

        // Filter tokens by exact chain name match
        const filteredTokens = Array.isArray(allTokens)
          ? allTokens.filter((token: any) => token.chain === chainName)
          : [];

        console.log(`Tokens for chain ${chainName} (ID: ${chainId}):`, filteredTokens);
        return filteredTokens;
      } catch (error) {
        console.error("Error fetching supported tokens:", error);
        throw error;
      }
    },
    staleTime: BALANCE_REFETCH_CONFIG.staleTime,
    gcTime: BALANCE_REFETCH_CONFIG.gcTime,
    retry: 1,
    enabled: !!chainId, // Only run query when chainId is provided
  });
};

/**
 * Hook for delayed balance refetch with chain awareness
 * Performs immediate refetch then schedules a delayed refetch for blockchain confirmation
 */
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
    [queryClient, chainId, user?.address]
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

interface EVMDepositMutationParams {
  chainId: string | number;
  tokenAddress: string;
  sender: string;
  amount: BigInt;
}

/**
 * Mutation hook for EVM deposit transactions
 * Accepts dynamic chainId parameter for multi-chain support
 */
export const useEVMDepositMutation = ({
  chainId,
  tokenAddress: _tokenAddress,
  sender: userAddress,
  amount: _amount,
}: EVMDepositMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { signTransaction, submitTransaction } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetchEVM(
    String(chainId)
  );
  const moneyFi = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

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

      // Convert amount to smallest unit (assuming 6 decimals for stablecoins)
      const amountInSmallestUnit = BigInt(
        Math.floor(Number(amount) * 1_000_000)
      );

      try {
        // Get deposit transaction payload with dynamic chain_id
        const payload = await moneyFi.getDepositTxPayload({
          sender: userAddress,
          chain_id: Number(chainId), // Convert to number for API
          token_address: tokenAddress,
          amount: amountInSmallestUnit,
        });

        console.log("Deposit payload received:", payload);

        // Decode base64 string to bytes
        const binaryString = atob(payload.tx);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Deserialize transaction
        const { Deserializer, RawTransaction, SimpleTransaction } =
          await import("@aptos-labs/ts-sdk");
        const de = new Deserializer(bytes);
        const depositTx = RawTransaction.deserialize(de);
        const depositTxSimple = new SimpleTransaction(depositTx);

        // Sign and submit transaction
        const submitTx = await signTransaction({
          transactionOrPayload: depositTxSimple,
        });
        const result = await submitTransaction({
          transaction: depositTxSimple,
          senderAuthenticator: submitTx.authenticator,
        });

        return result;
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

interface EVMWithdrawMutationParams {
  chainId: string | number;
  tokenAddress: string;
  amount: BigInt;
}

interface WithdrawPayload {
  encoded_signature: string;
  encoded_pubkey: string;
  full_message: string;
}

/**
 * Mutation hook for EVM withdraw transactions
 * Handles message signing and status polling with dynamic chain_id
 */
export const useEVMWithdrawMutation = ({
  chainId,
  tokenAddress,
  amount: _amount,
}: EVMWithdrawMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { account: aptosAccount } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetchEVM(
    String(chainId)
  );
  const moneyFi = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
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
      payload: WithdrawPayload;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!aptosAccount) {
        throw new Error("Wallet account not connected");
      }

      try {
        // Transform payload to match API expectations
        const transformedPayload = {
          signature: payload.encoded_signature,
          pubkey: payload.encoded_pubkey,
          message: payload.full_message,
        };

        // Request withdrawal with dynamic chain_id
        await moneyFi.reqWithdraw(address, transformedPayload);
        console.log("Withdraw request submitted");

        // Poll for withdraw status until it's done
        const pollWithdrawStatus = async (): Promise<any> => {
          while (true) {
            const statusResponse = await moneyFi.getWithdrawStatus(
              user.address
            );

            if (
              (statusResponse as any) === "done" ||
              (statusResponse as any)?.status === "done"
            ) {
              // Fetch wallet amount to check withdraw_amount
              const walletAmountResponse = await moneyFi.getWalletAccountAssets(
                {
                  sender: user.address,
                }
              );

              // Find the matching token by comparing token_address
              const targetAddress = tokenAddress.replace("0x", "");
              const matchedToken = (walletAmountResponse as any)?.data?.find(
                (token: { token_address: string; withdraw_amount: string }) =>
                  token.token_address === targetAddress
              );

              // Determine the actual amount to withdraw
              let actualAmount: BigInt = _amount;
              if (matchedToken) {
                const withdrawAmountBigInt = BigInt(
                  matchedToken.withdraw_amount
                );
                const requestedAmountBigInt = BigInt(_amount.toString());
                // If withdraw_amount is smaller than requested amount, use withdraw_amount
                if (withdrawAmountBigInt < requestedAmountBigInt) {
                  actualAmount = withdrawAmountBigInt as any;
                }
              }

              // Get withdraw transaction payload with dynamic chain_id
              const txPayload = await moneyFi.getWithdrawTxPayload({
                sender: user.address,
                chain_id: Number(chainId), // Convert to number for API
                token_address: tokenAddress,
                amount: actualAmount as bigint,
              });

              return { txPayload };
            }

            // Wait 3 seconds before checking again
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        };

        return await pollWithdrawStatus();
      } catch (error) {
        console.error("Withdraw process failed:", error);
        throw error;
      }
    },

    onSuccess: async (data) => {
      const { txPayload } = data;

      try {
        // Decode base64 string to bytes
        const binaryString = atob(txPayload.tx);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Deserialize and submit transaction
        const { Deserializer, RawTransaction, SimpleTransaction } =
          await import("@aptos-labs/ts-sdk");
        const de = new Deserializer(bytes);
        const withdrawTx = RawTransaction.deserialize(de);
        const withdrawTxSimple = new SimpleTransaction(withdrawTx);

        const submitTx = await signTransaction({
          transactionOrPayload: withdrawTxSimple,
        });
        await submitTransaction({
          transaction: withdrawTxSimple,
          senderAuthenticator: submitTx.authenticator,
        });

        await triggerDelayedRefetch({
          immediate: true,
          delayed: true,
        });
      } catch (error) {
        console.error("Withdraw transaction submission failed:", error);
        throw error;
      }
    },

    onError: (error) => {
      console.error("Withdraw mutation error:", error);
      cleanup();
    },

    retry: false, // Don't retry mutations automatically
  });
};
