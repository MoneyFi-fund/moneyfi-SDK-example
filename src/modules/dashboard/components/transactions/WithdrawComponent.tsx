import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
  Link,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import { useWallet, type InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MoneyFiAptos } from "aptosmoneyfimockupupgrade";


export const WithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const moneyFiAptos = new MoneyFiAptos();

  const handleWithdraw = async () => {
    if (!isAuthenticated || !user) {
      setMessage("Please connect your wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      const payload = await moneyFiAptos.getWithdrawTxPayload();
      console.log(JSON.stringify(payload, null, 2));
      const transaction: InputTransactionData = {
        data: {
          function: payload.function as `${string}::${string}::${string}`,
          functionArguments: payload.functionArguments,
        }
      };
      
      console.log("Transaction response:", transaction);
      const response = await signAndSubmitTransaction(transaction);
      console.log(response.hash);
      
      setMessage("Withdrawal successful!");
      setTransactionHash(response.hash);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setMessage(error instanceof Error ? error.message : "Withdrawal failed");
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
            Withdraw Fund
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.500">
            Please connect your wallet to withdraw funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="semibold">
          Withdraw Funds
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.600">
            Withdraw all your deposited funds from the MoneyFi strategy
          </Text>

          <Button
            onClick={handleWithdraw}
            loading={isLoading}
            disabled={isLoading}
            colorScheme="red"
            variant="outline"
            size="md"
          >
            {isLoading ? "Withdrawing..." : "Withdraw All"}
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