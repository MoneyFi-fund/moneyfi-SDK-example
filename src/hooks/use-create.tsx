import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useWallet,
  type InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { MoneyFi } from "quy-ts-sdk";
// import { MoneyFi } from "@moneyfi/ts-sdk";
import { useAuth } from "@/provider/auth-provider";

export const createQueryKeys = {
  all: ["create"] as const,
  user: (address?: string) =>
    [...createQueryKeys.all, "user", address] as const,
  partnership: (address?: string) =>
    [...createQueryKeys.all, "partnership", address] as const,
  initialization: (address?: string) =>
    [...createQueryKeys.all, "initialization", address] as const,
};

export const useGetOrCreateUserMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

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
        // Step 1: Check if user already exists
        let userInfo;
        try {
          userInfo = await moneyFiAptos.getUserInformation(address);
          if (userInfo) {
            return userInfo;
          }
        } catch (error) {
          // User doesn't exist, continue to create
        }

        // Step 2: Create user if not found
        const createUserPayload = {
          user_address: { Aptos: address },
          ref_by: refBy || null,
          is_partnership: false,
        };
        const result = await moneyFiAptos.createUser(createUserPayload);
        return result;
      } catch (error) {
        console.error("Error creating/getting user:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
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
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        // Step 1: Check if user already exists
        let userInfo;
        try {
          userInfo = await moneyFiAptos.getUserInformation(address);
          if (userInfo) {
            return userInfo;
          }
        } catch (error) {
          // User doesn't exist, continue to create
        }

        // Step 2: Create partnership user if not found
        const createUserPayload = {
          user_address: { Aptos: address },
          ref_by: null,
          is_partnership: true,
        };
        const result = await moneyFiAptos.createUser(createUserPayload);
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

export const useInitializationAccountMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const createUserPayload = {
          user_address: { Aptos: address },
          ref_by: null,
          is_partnership: false,
        };
        const result = await moneyFiAptos.createUser(createUserPayload);
        return result;
      } catch (error) {
        console.error("Error creating user for initialization:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: createQueryKeys.user(variables.address),
      });
      queryClient.invalidateQueries({
        queryKey: createQueryKeys.initialization(variables.address),
      });
    },
    onError: (error) => {
      console.error("User creation for initialization failed:", error);
    },
    retry: false,
  });
};

export const useGetTxInitializationAccountMutation = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      if (!isAuthenticated || !user) {
        throw new Error("Please connect your wallet first");
      }

      if (!address) {
        throw new Error("Address is required");
      }

      try {
        const initializationData =
          await moneyFiAptos.getInitializationWalletAccountTxPayload({
            user_address: { Aptos: address }
          });
        if (
          initializationData &&
          typeof initializationData === "object" &&
          "function" in initializationData
        ) {
          const transaction: InputTransactionData = {
            data: {
              // @ts-ignore
              function:
              // @ts-ignore
                initializationData.function as `${string}::${string}::${string}`,
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
