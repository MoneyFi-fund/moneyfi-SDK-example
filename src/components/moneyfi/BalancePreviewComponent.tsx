import React, { useState, useEffect } from 'react';
import {
  Card,
  VStack,
  Text,
  Button,
  Stat,
  Alert,
  HStack,
  Skeleton
} from '@chakra-ui/react';
import { useAuth } from '@/providers/auth-provider';
import { previewWithdraw } from 'moneyfiaptosmockup';

export const BalancePreviewComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchBalance = async () => {
    if (!isAuthenticated || !user) {
      setBalance(null);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Get the withdrawable balance
      const withdrawableAmount = await previewWithdraw(user.address);
      
      // Convert from smallest unit to USDC (assuming 6 decimals)
      const balanceInUsdc = withdrawableAmount / 1_000_000;
      setBalance(balanceInUsdc);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch balance');
      setBalance(null);
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
            <Skeleton height="60px" />
          ) : error ? (
            <Alert.Root status="error">
              <Alert.Description>
                {error}
              </Alert.Description>
            </Alert.Root>
          ) : (
            <Stat.Root>
              <Stat.Label color="gray.500">
                Available to Withdraw
              </Stat.Label>
              <Stat.ValueText fontSize="3xl" fontWeight="bold">
                {balance !== null ? `${balance.toFixed(6)} USDC` : '-- USDC'}
              </Stat.ValueText>
            </Stat.Root>
          )}

          <Text fontSize="sm" color="gray.600">
            This shows the amount you can withdraw from the MoneyFi strategy
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};