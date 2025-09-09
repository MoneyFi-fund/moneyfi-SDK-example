import React, { useState } from 'react';
import {
  Card,
  VStack,
  Text,
  Button,
  Alert
} from '@chakra-ui/react';
import { useAuth } from '@/providers/auth-provider';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { getWithdrawTxPayload } from 'moneyfiaptosmockup';

export const WithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleWithdraw = async () => {
    if (!isAuthenticated || !user) {
      setMessage('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      // Get the transaction payload
      const payload = getWithdrawTxPayload(user.address);
      
      // Submit the transaction
      const response = await signAndSubmitTransaction(payload);
      
      setMessage(`Withdrawal successful! Transaction: ${response.hash}`);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setMessage(error instanceof Error ? error.message : 'Withdrawal failed');
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
            {isLoading ? 'Withdrawing...' : 'Withdraw All'}
          </Button>

          {message && (
            <Alert.Root status={message.includes('successful') ? 'success' : 'error'}>
              <Alert.Description>
                {message}
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};