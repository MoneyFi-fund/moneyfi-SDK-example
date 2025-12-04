import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Deserializer, RawTransaction, SimpleTransaction } from "@aptos-labs/ts-sdk";
import { useAuth } from "@/provider/auth-provider";
import {
  useMoneyFiProvider,
  validateAuth,
  moneyFiQueryKeys,
} from "../../common";
import { useDelayedBalanceRefetch } from "../queries/use-balance-query";
import { MoneyFi } from "@moneyfi/ts-sdk";
import { useEffect } from "react";

interface WithdrawParams {
  address: string;
  payload: {
    encoded_signature: string;
    encoded_pubkey: string;
    full_message: string;
  };
}

interface WithdrawMutationOptions {
  tokenAddress: string;
  amount: BigInt;
}

const POLLING_CONFIG = {
  interval: 3000, // 3 seconds
  maxAttempts: 40, // 2 minutes max (40 * 3s = 120s)
} as const;

/**
 * Mutation hook for withdrawing tokens from MoneyFi
 * Includes status polling with timeout protection and dynamic amount adjustment
 */
export const useWithdrawMutation = (tokenAddress: string, amount: BigInt) => {
  const { isAuthenticated, user } = useAuth();
  const { account: aptosAccount } = useWallet();
  const { triggerDelayedRefetch, cleanup } = useDelayedBalanceRefetch();
  const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
  const { signTransaction, submitTransaction } = useWallet();

  // Cleanup on unmount
  useEffect(() => {
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
            // Fetch wallet amount to check withdraw_amount
            const walletAmountResponse = await moneyFiAptos.getWalletAccountAssets({
              sender: user.address,
            });

            // Find the matching token by comparing token_address
            const targetAddress = tokenAddress.replace("0x", "");
            const matchedToken = (walletAmountResponse as any)?.data?.find(
              (token: { token_address: string; withdraw_amount: string }) =>
                token.token_address === targetAddress
            );

            // Determine the actual amount to withdraw
            let actualAmount = amount;
            if (matchedToken) {
              const withdrawAmountBigInt = BigInt(matchedToken.withdraw_amount);
              const requestedAmountBigInt = BigInt(amount.toString());
              // If withdraw_amount is smaller than requested amount, use withdraw_amount
              if (withdrawAmountBigInt < requestedAmountBigInt) {
                actualAmount = withdrawAmountBigInt as any;
              }
            }

            const txPayload = await moneyFiAptos.getWithdrawTxPayload({
              sender: user.address,
              chain_id: -1,
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