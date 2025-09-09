import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
} from "@chakra-ui/react";
import { useAuth } from "@/providers/auth-provider";
import { useWallet, type InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { MoneyFiAptos } from "moneyfiaptosmockup";
import {
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";

export const WithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const config = new AptosConfig({
    network: Network.MAINNET,
  });
  const moneyFiAptos = new MoneyFiAptos(config);

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
      
      setMessage(`Withdrawal successful! Transaction: ${response.hash}`);
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setMessage(error instanceof Error ? error.message : "Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Withdraw USDC
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.500">
            Please connect your wallet to withdraw USDC
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="semibold">
          Withdraw USDC
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.600">
            Withdraw all your deposited USDC from the MoneyFi strategy
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
              <Alert.Description>{message}</Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};