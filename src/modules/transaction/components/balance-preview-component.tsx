import React from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Stat,
  Alert,
  HStack,
  Skeleton,
  Badge,
  Spinner,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import {
  useBalanceQuery,
  useTransactionConfirmationStatus,
} from "@/api/use-moneyfi-queries";

export const BalancePreviewComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const {
    data: balanceData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBalanceQuery();

  const { isInConfirmationWindow, lastUpdateTime } =
    useTransactionConfirmationStatus();

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
            Withdrawable Balance
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to view your balance
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
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center" width="100%">
            <Text fontSize="lg" fontWeight="semibold" color="white">
              Withdrawable Balance
            </Text>
            <Button
              onClick={() => refetch()}
              loading={isLoading || isFetching}
              size="sm"
              bg="gray.700"
              color="white"
              border="2px solid white"
              borderRadius="0"
              boxShadow="3px 3px 0px white"
              transition="all 0.3s ease"
              fontWeight="bold"
              fontSize="xs"
              _hover={{
                bg: "gray.600",
                color: "white",
                transform: "translate(1px, 1px)",
                boxShadow: "2px 2px 0px white",
              }}
              _active={{
                transform: "translate(2px, 2px)",
                boxShadow: "1px 1px 0px white",
              }}
              _loading={{
                bg: "gray.600",
                transform: "none",
                boxShadow: "3px 3px 0px white",
              }}
            >
              Refresh
            </Button>
          </HStack>
          
          <HStack justify="space-between" align="center" width="100%">
            {lastUpdateTime && (
              <Text fontSize="xs" color="gray.400">
                Last updated: {lastUpdateTime.toLocaleTimeString()}
              </Text>
            )}
            {isInConfirmationWindow && (
              <Badge
                colorScheme="blue"
                variant="subtle"
                fontSize="xs"
                py={1}
                borderRadius="md"
              >
                <HStack gap={1}>
                  <Spinner size="xs" />
                  <Text>Updating...</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </VStack>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          {isLoading ? (
            <VStack gap={3}>
              <Skeleton height="80px" />
              <Skeleton height="80px" />
            </VStack>
          ) : (
            <VStack align="stretch" gap={3}>
              <Stat.Root>
                <Stat.Label color="gray.400">
                  USDT Available to Withdraw
                </Stat.Label>
                <Stat.ValueText
                  fontSize="3xl"
                  fontWeight="medium"
                  color="green.600"
                >
                  {`${(balanceData?.usdt || 0).toFixed(6)} USDT`}
                </Stat.ValueText>
              </Stat.Root>

              <Stat.Root>
                <Stat.Label color="gray.400">
                  USDC Available to Withdraw
                </Stat.Label>
                <Stat.ValueText
                  fontSize="3xl"
                  fontWeight="medium"
                  color="blue.600"
                >
                  {`${(balanceData?.usdc || 0).toFixed(6)} USDC`}
                </Stat.ValueText>
              </Stat.Root>
            </VStack>
          )}

          {error && (
            <Alert.Root status="error">
              <Alert.Description>
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch balance"}
              </Alert.Description>
            </Alert.Root>
          )}

          <VStack align="stretch" gap={2}>
            {isInConfirmationWindow && (
              <Text fontSize="xs" color="blue.300" fontStyle="italic">
                Balance is being updated to reflect recent blockchain
                confirmations...
              </Text>
            )}
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
