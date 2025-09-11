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
import { useDepositMutation } from "@/hooks/use-moneyfi-queries";

export const DepositComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);

  const depositMutation = useDepositMutation();

  const handleDeposit = async () => {
    if (amount) {
      // Clear previous success data when starting new deposit
      setSuccessData(null);
      
      depositMutation.mutate(amount, {
        onSuccess: (data) => {
          setAmount("");
          setSuccessData({ hash: data.hash });
        },
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Deposit Funds
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.500">
            Please connect your wallet to deposit funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="semibold">
          Deposit Funds
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium">
              Amount
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
            loading={depositMutation.isPending}
            disabled={!amount || depositMutation.isPending}
            colorScheme="blue"
            size="md"
          >
            {depositMutation.isPending ? "Depositing..." : "Deposit"}
          </Button>

          {(depositMutation.isSuccess && depositMutation.data) || successData ? (
            <Alert.Root status="success">
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text>Deposit successful!</Text>
                  <HStack>
                    <Text fontSize="sm">Transaction:</Text>
                    <Link
                      href={`https://explorer.aptoslabs.com/txn/${successData?.hash || depositMutation.data?.hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      fontSize="sm"
                      fontFamily="mono"
                      textDecoration="underline"
                    >
                      {(successData?.hash || depositMutation.data?.hash)?.slice(0, 8)}...{(successData?.hash || depositMutation.data?.hash)?.slice(-8)}
                    </Link>
                  </HStack>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {depositMutation.isError && (
            <Alert.Root status="error">
              <Alert.Description>
                {depositMutation.error instanceof Error ? depositMutation.error.message : "Deposit failed"}
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
