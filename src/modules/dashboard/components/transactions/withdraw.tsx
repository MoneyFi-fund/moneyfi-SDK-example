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
import { useWithdrawMutation } from "@/api/use-moneyfi-queries";
import { useCheckWalletAccountQuery } from "@/api/use-check-wallet-account";

export const WithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: hasWalletAccount, isLoading: isCheckingAccount } =
    useCheckWalletAccountQuery();
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
            Withdraw Fund
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to withdraw funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!hasWalletAccount && !isCheckingAccount) {
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
            MoneyFi Account Status
          </Text>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" gap={3}>
            <Alert.Root
              status="warning"
              bg="yellow.800"
              border="2px solid yellow.300"
              borderRadius="0"
              boxShadow="3px 3px 0px yellow.300"
            >
              <Alert.Description>
                <Text color="yellow.100" fontWeight="bold">
                  Account not found
                </Text>
                <Text color="yellow.200" fontSize="sm" mt={1}>
                  You need a MoneyFi account to withdraw funds. Please contact
                  support or create an account first.
                </Text>
              </Alert.Description>
            </Alert.Root>
          </VStack>
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
          Withdraw Funds
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.400">
            Withdraw all your deposited funds from the MoneyFi strategy
          </Text>

          <Button
            onClick={handleWithdraw}
            loading={withdrawMutation.isPending || isCheckingAccount}
            disabled={
              withdrawMutation.isPending ||
              isCheckingAccount ||
              !hasWalletAccount
            }
            bg="red.600"
            color="white"
            size="md"
            border="3px solid white"
            borderRadius="0"
            boxShadow="5px 5px 0px white"
            transition="all 0.3s ease"
            fontWeight="bold"
            _hover={{
              bg: "red.500",
              color: "white",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px white",
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px white",
            }}
            _loading={{
              bg: "red.500",
              color: "white",
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
            {isCheckingAccount
              ? "Checking Account..."
              : withdrawMutation.isPending
              ? "Withdrawing..."
              : "Withdraw All"}
          </Button>

          {successData ? (
            <Alert.Root
              status="success"
              bg="green.900"
              border="2px solid green.400"
              borderRadius="0"
              boxShadow="4px 4px 0px green.400"
            >
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text color="green.100" fontWeight="bold">
                    Withdrawal successful!
                  </Text>
                  <HStack>
                    <Text fontSize="sm" color="green.200">
                      Transaction:
                    </Text>
                    <Link
                      href={`https://explorer.aptoslabs.com/txn/${successData.hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="green.300"
                      fontSize="sm"
                      fontFamily="mono"
                      textDecoration="underline"
                      _hover={{ color: "green.100" }}
                    >
                      {successData.hash.slice(0, 8)}...
                      {successData.hash.slice(-8)}
                    </Link>
                  </HStack>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {withdrawMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
                  {withdrawMutation.error instanceof Error
                    ? withdrawMutation.error.message
                    : "Withdrawal failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
