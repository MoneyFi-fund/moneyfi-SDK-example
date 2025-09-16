import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useWallet,
  type InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { MoneyFiAptos } from "testquynx";
import { useAuth } from "@/provider/auth-provider";

export const createQueryKeys = {
  all: ["create"] as const,
  user: (address?: string) => [...createQueryKeys.all, "user", address] as const,
  partnership: (address?: string) => [...createQueryKeys.all, "partnership", address] as const,
  initialization: (address?: string) => [...createQueryKeys.all, "initialization", address] as const,
};

export const useGetOrCreateUserMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFiAptos();

  return useMutation({
    mutationFn: async ({
      address,
      refBy,
    }: {
      address: string;
      refBy?: string;
    }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const result = await moneyFiAptos.getOrCreateUser(address, refBy);
        return result;
      } catch (error) {
        console.error("Error creating/getting user:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log("User created/retrieved successfully:", data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: createQueryKeys.user(variables.address),
      });
    },
    onError: (error) => {
      console.error("Create/get user failed:", error);
    },
    retry: false,
  });
};

export const useGetOrCreatePartnershipMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFiAptos();

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const result = await moneyFiAptos.getOrCreatePartnership(address);
        return result;
      } catch (error) {
        console.error("Error creating/getting partnership:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      
      queryClient.invalidateQueries({
        queryKey: createQueryKeys.partnership(variables.address),
      });
    },
    onError: (error) => {
      console.error("Create/get partnership failed:", error);
    },
    retry: false,
  });
};

export const useGetTxInitializationAccountMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFiAptos();

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const initializationData = await moneyFiAptos.getTxInitializationWalletAccount(address);
        console.log(initializationData)
        if (initializationData && typeof initializationData === 'object' && 'function' in initializationData) {
          const transaction: InputTransactionData = {
            data: {
              // @ts-ignore
              function: initializationData.function as `${string}::${string}::${string}`,
              // @ts-ignore
              functionArguments: initializationData.functionArguments || [],
            },
          };

          const response = await signAndSubmitTransaction(transaction);
          return response;
        }

        return initializationData;
      } catch (error) {
        console.error("Error initializing account:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: createQueryKeys.initialization(variables.address),
      });
    },
    onError: (error) => {
      console.error("Account initialization failed:", error);
    },
    retry: false,
  });
};