import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Deserializer, RawTransaction, SimpleTransaction } from "@aptos-labs/ts-sdk";
import { useAuth } from "@/provider/auth-provider";
import {
  useMoneyFiProvider,
  validateAuth,
  moneyFiQueryKeys,
  useDelayedBalanceRefetch,
} from "../../common";

interface DepositMutationParams {
  tokenAddress: string;
  sender: string;
  amount: BigInt;
}

interface DepositParams {
  amount: string;
  tokenAddress: string;
}

/**
 * Mutation hook for depositing tokens to MoneyFi
 * Handles transaction signing, submission, and balance refetch
 */
export const useDepositMutation = ({
  tokenAddress,
  sender: userAddress,
  amount,
}: DepositMutationParams) => {
  const { isAuthenticated, user } = useAuth();
  const { signTransaction, submitTransaction } = useWallet();
  const moneyFiAptos = useMoneyFiProvider();

  const { triggerRefetch, cleanup } = useDelayedBalanceRefetch(
    moneyFiQueryKeys.balance(user?.address)
  );

  return useMutation({
    mutationFn: async ({ amount, tokenAddress }: DepositParams) => {
      validateAuth(isAuthenticated, user);

      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const amountInSmallestUnit = BigInt(
        Math.floor(Number(amount) * 1_000_000)
      );

      // Generate transaction payload via SDK
      const payload = await moneyFiAptos.getDepositTxPayload({
        sender: userAddress,
        chain_id: -1, // Aptos mainnet
        token_address: tokenAddress,
        amount: amountInSmallestUnit,
      });

      // Decode base64 transaction
      const binaryString = atob(payload.tx);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Deserialize and sign
      const de = new Deserializer(bytes);
      const depositTx = RawTransaction.deserialize(de);
      const depositTxSimple = new SimpleTransaction(depositTx);

      const submitTx = await signTransaction({
        transactionOrPayload: depositTxSimple,
      });

      // Submit to blockchain
      const result = await submitTransaction({
        transaction: depositTxSimple,
        senderAuthenticator: submitTx.authenticator,
      });

      return result;
    },

    onSuccess: async () => {
      await triggerRefetch({ immediate: true, delayed: true });
    },

    onError: (error) => {
      console.error("Deposit transaction failed:", error);
      cleanup();
    },

    onSettled: () => {
      cleanup();
    },

    retry: false,
  });
};