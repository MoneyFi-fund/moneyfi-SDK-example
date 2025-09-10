import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Input,
  Alert,
  Link,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import { useWallet, type InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MoneyFiAptos } from "aptosmoneyfimockupupgrade";

export const DepositComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  const moneyFiAptos = new MoneyFiAptos();
  const handleDeposit = async () => {
    if (!isAuthenticated || !user) {
      setMessage("Please connect your wallet first");
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const amountInSmallestUnit = BigInt(
        Math.floor(Number(amount) * 1_000_000)
      );

      const payload = await moneyFiAptos.getDepositTxPayload(
        amountInSmallestUnit
      );
      const transaction: InputTransactionData = {
        data: {
          function: payload.function as `${string}::${string}::${string}`,
          functionArguments: payload.functionArguments,
        }
      };
      const response = await signAndSubmitTransaction(transaction);
      setMessage("Deposit successful!");
      setTransactionHash(response.hash);
      setAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
      setMessage(error instanceof Error ? error.message : "Deposit failed");
      setTransactionHash("");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Deposit USDC
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.500">
            Please connect your wallet to deposit USDC
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="semibold">
          Deposit USDC
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium">
              Amount (USDC)
            </Text>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
            />
          </VStack>

          <Button
            onClick={handleDeposit}
            loading={isLoading}
            disabled={!amount || isLoading}
            colorScheme="blue"
            size="md"
          >
            {isLoading ? "Depositing..." : "Deposit"}
          </Button>

          {message && (
            <Alert.Root
              status={message.includes("successful") ? "success" : "error"}
            >
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text>{message}</Text>
                  {transactionHash && (
                    <HStack>
                      <Text fontSize="sm">Transaction:</Text>
                      <Link
                        href={`https://explorer.aptoslabs.com/txn/${transactionHash}?network=mainnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="blue.500"
                        fontSize="sm"
                        fontFamily="mono"
                        textDecoration="underline"
                      >
                        {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
                      </Link>
                    </HStack>
                  )}
                </VStack>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
