import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import { useGetTxInitializationAccountMutation } from "@/hooks/use-create";
import {
  useWallet as useAptosWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  AccountAddress,
  AccountAuthenticator,
  Deserializer,
  MultiAgentTransaction,
  SignedTransaction,
  TransactionAuthenticatorMultiAgent,
} from "@aptos-labs/ts-sdk";
import {
  APTOS_CONFIG,
  aptosClient,
} from "@/constants/aptos";
import { APTOS_ERROR_CODE } from "@/constants/error";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";

export const InitAccountComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [_signedTx, setSignedTx] = useState<string | null>(null);
  const { data: hasWalletAccount, isLoading: _isCheckingAccount } =
    useCheckWalletAccountQuery();

  const {
    account: aptosAccount,
    signTransaction: aptosSignTransaction,
    submitTransaction: aptosSubmitTransaction,
    signAndSubmitTransaction: _aptosSignAndSubmitTransaction,
  } = useAptosWallet();
  const initAccountMutation = useGetTxInitializationAccountMutation();

  const checkOrCreateAptosAccount = async () => {
    if (!user?.address || !aptosAccount?.address) return;

    try {
      const data = await new Promise<any>(
        (resolve, reject) => {
          initAccountMutation.mutate(
            { address: user.address },
            {
              onSuccess: (data) => {
                resolve(data);
              },
              onError: (error) => {
                reject(error);
              },
            }
          );
        }
      );

      const signed_tx = typeof data === 'object' && data?.signed_tx ? data.signed_tx : null;
      if (!signed_tx) {
        throw new Error("No signed transaction returned from initialization");
      }

      setSignedTx(signed_tx);

      const txBytes = new Uint8Array(
        atob(signed_tx)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
      const de = new Deserializer(txBytes);
      const tx = SignedTransaction.deserialize(de);
      const operatorAuth = (
        tx.authenticator as TransactionAuthenticatorMultiAgent
      ).sender.bcsToBytes();
      const operatorAddress = new AccountAddress(
        new Uint8Array(
          APTOS_CONFIG.OPERATOR_ADDRESS.match(/.{1,2}/g)?.map((byte) =>
            parseInt(byte, 16)
          ) || []
        )
      );
      const multiAgentTx = new MultiAgentTransaction(tx.raw_txn, [
        operatorAddress,
      ]);

      const feepayerAuthenticator = await aptosSignTransaction({
        transactionOrPayload: multiAgentTx,
      });

      const submitTx = await aptosSubmitTransaction({
        transaction: multiAgentTx,
        senderAuthenticator: feepayerAuthenticator.authenticator,
        additionalSignersAuthenticators: [
          AccountAuthenticator.deserialize(new Deserializer(operatorAuth)),
        ],
      });

      const response = await aptosClient.waitForTransaction({
        transactionHash: submitTx.hash,
      });

      if (!response.success) {
        throw new Error(APTOS_ERROR_CODE.CREATE_ACCOUNT_FAILED);
      }
    } catch (error) {
      console.error("Account initialization failed:", error);
      throw error;
    }
  };

  const handleInitAccount = () => {
    checkOrCreateAptosAccount().catch((error) => {
      console.error("Error in account initialization:", error);
    });
  };

  if (!isAuthenticated) {
    return (
      <Card.Root
        bg="gray.900"
        border="2px solid white"
        borderRadius="0"
        boxShadow="4px 4px 0px white"
        transition="all 0.3s ease"
        _hover={{
          transform: "translate(-1px, -1px)",
          boxShadow: "5px 5px 0px white",
        }}
      >
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold" color="white">
            Initialize Account
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to initialize your account.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      bg="black"
      border="2px solid white"
      borderRadius="0"
      boxShadow="4px 4px 0px white"
      transition="all 0.3s ease"
      _hover={{
        transform: "translate(-1px, -1px)",
        boxShadow: "5px 5px 0px white",
      }}
    >
      <Card.Header>
        <Text fontSize="lg" fontWeight="semibold" color="white">
          Initialize Account
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.300">
            Initialize your MoneyFi account on the blockchain.
          </Text>

          <Button
            onClick={handleInitAccount}
            loading={initAccountMutation.isPending}
            disabled={initAccountMutation.isPending || !!hasWalletAccount}
            bg="blue.500"
            color="white"
            size="md"
            border="3px solid white"
            borderRadius="0"
            boxShadow="5px 5px 0px white"
            transition="all 0.3s ease"
            fontWeight="bold"
            _hover={{
              bg: "blue.400",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px white",
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px white",
            }}
            _loading={{
              bg: "blue.400",
              transform: "none",
              boxShadow: "5px 5px 0px white",
            }}
            _disabled={{
              bg: "gray.600",
              color: "gray.300",
              cursor: "not-allowed",
              transform: "none",
              boxShadow: "5px 5px 0px gray.400",
            }}
          >
            {initAccountMutation.isPending
              ? "Initializing..."
              : "Initialize Account"}
          </Button>

          {initAccountMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
                  {initAccountMutation.error instanceof Error
                    ? initAccountMutation.error.message
                    : "Account initialization failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
