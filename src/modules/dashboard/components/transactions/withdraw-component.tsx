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
import { useWithdrawMutation } from "@/hooks/use-moneyfi-queries";


export const WithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const withdrawMutation = useWithdrawMutation();

  const handleWithdraw = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    setSuccessData(null);

    try {
      const result = await withdrawMutation.mutateAsync();
      setSuccessData({ hash: result.hash });
    } catch (error) {
      console.error("Withdrawal failed:", error);
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
            loading={withdrawMutation.isPending}
            disabled={withdrawMutation.isPending}
            colorScheme="red"
            variant="outline"
            size="md"
          >
            {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw All"}
          </Button>

          {(withdrawMutation.isSuccess && withdrawMutation.data) || successData ? (
            <Alert.Root status="success">
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text>Withdrawal successful!</Text>
                  <HStack>
                    <Text fontSize="sm">Transaction:</Text>
                    <Link
                      href={`https://explorer.aptoslabs.com/txn/${successData?.hash || withdrawMutation.data?.hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      fontSize="sm"
                      fontFamily="mono"
                      textDecoration="underline"
                    >
                      {(successData?.hash || withdrawMutation.data?.hash)?.slice(0, 8)}...{(successData?.hash || withdrawMutation.data?.hash)?.slice(-8)}
                    </Link>
                  </HStack>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {withdrawMutation.isError && (
            <Alert.Root status="error">
              <Alert.Description>
                {withdrawMutation.error instanceof Error ? withdrawMutation.error.message : "Withdrawal failed"}
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};