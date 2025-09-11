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
import { useBalanceQuery, useTransactionConfirmationStatus } from "@/hooks/use-moneyfi-queries";

export const BalancePreviewComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  
  const {
    data: balanceData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBalanceQuery();

  const {
    isInConfirmationWindow,
    lastUpdateTime,
  } = useTransactionConfirmationStatus();

  if (!isAuthenticated) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Withdrawable Balance
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.500">
            Please connect your wallet to view your balance
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <VStack align="baseline" gap={2}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Withdrawable Balance
            </Text>
            <HStack gap={2}>
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
              <Button
                onClick={() => refetch()}
                loading={isLoading || isFetching}
                size="sm"
                variant="ghost"
                _hover={{ bg: "gray.700", color: "white" }}
              >
                Refresh
              </Button>
            </HStack>
          </HStack>
          
          {lastUpdateTime && (
            <Text fontSize="xs" color="gray.500" textAlign="right">
              Last updated: {lastUpdateTime.toLocaleTimeString()}
            </Text>
          )}
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
                <Stat.Label color="gray.500">
                  USDT Available to Withdraw
                </Stat.Label>
                <Stat.ValueText fontSize="3xl" fontWeight="bold">
                  {`${(balanceData?.usdt || 0).toFixed(6)} USDT`}
                </Stat.ValueText>
              </Stat.Root>

              <Stat.Root>
                <Stat.Label color="gray.500">
                  USDC Available to Withdraw
                </Stat.Label>
                <Stat.ValueText fontSize="3xl" fontWeight="bold">
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
              <Text fontSize="xs" color="blue.500" fontStyle="italic">
                Balance is being updated to reflect recent blockchain confirmations...
              </Text>
            )}
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
