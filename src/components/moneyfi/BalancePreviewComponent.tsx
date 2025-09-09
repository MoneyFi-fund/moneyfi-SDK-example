import React, { useState, useEffect } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Stat,
  Alert,
  HStack,
  Skeleton,
} from "@chakra-ui/react";
import { useAuth } from "@/providers/auth-provider";
import { MoneyFiAptos } from "moneyfiaptosmockup";
import {
  AptosConfig,
  Network,
} from "@aptos-labs/ts-sdk";

export const BalancePreviewComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [balanceUsdt, setBalanceUsdt] = useState<number | null>(null);
  const [balanceUsdc, setBalanceUsdc] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const config = new AptosConfig({
    network: Network.MAINNET,
  });
  const moneyFiAptos = new MoneyFiAptos(config);

  const fetchBalance = async () => {
    if (!isAuthenticated || !user) {
      setBalanceUsdt(null);
      setBalanceUsdc(null);
      return;
    }

    try {
      setIsLoading(true);
      setMessage("");

      // Get the withdrawable balance
      const withdrawableAmount = await moneyFiAptos.previewWithdraw(user.address);
      // Convert from smallest unit (assuming 6 decimals for both USDT and USDC)
      const balanceInUsdt = withdrawableAmount[0][0] / 1_000_000;
      const balanceInUsdc = withdrawableAmount[0][1] / 1_000_000;
      
      setBalanceUsdt(balanceInUsdt);
      setBalanceUsdc(balanceInUsdc);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      setMessage(error instanceof Error ? error.message : "Failed to fetch balance");
      setBalanceUsdt(null);
      setBalanceUsdc(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance on component mount and when authentication changes
  useEffect(() => {
    fetchBalance();
  }, [isAuthenticated, user]);

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
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="semibold">
            Withdrawable Balance
          </Text>
          <Button
            onClick={fetchBalance}
            loading={isLoading}
            size="sm"
            variant="ghost"
          >
            Refresh
          </Button>
        </HStack>
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
                  {balanceUsdt !== null ? `${balanceUsdt.toFixed(6)} USDT` : "-- USDT"}
                </Stat.ValueText>
              </Stat.Root>
              
              <Stat.Root>
                <Stat.Label color="gray.500">
                  USDC Available to Withdraw
                </Stat.Label>
                <Stat.ValueText fontSize="3xl" fontWeight="bold">
                  {balanceUsdc !== null ? `${balanceUsdc.toFixed(6)} USDC` : "-- USDC"}
                </Stat.ValueText>
              </Stat.Root>
            </VStack>
          )}

          {message && (
            <Alert.Root status="error">
              <Alert.Description>{message}</Alert.Description>
            </Alert.Root>
          )}

          <Text fontSize="sm" color="gray.600">
            This shows the amounts you can withdraw from the MoneyFi strategy in both USDT and USDC
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};