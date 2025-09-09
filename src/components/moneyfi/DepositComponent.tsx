import React, { useState } from 'react';
import {
  Card,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Alert
} from '@chakra-ui/react';
import { useAuth } from '@/providers/auth-provider';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import {MoneyFiAptos} from 'moneyfiaptosmockup';
import { Account, Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const DepositComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { signAndSubmitTransaction } = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const config = new AptosConfig({
    network: Network.MAINNET
  })
  const moneyFiAptos = new MoneyFiAptos(config);
  const handleDeposit = async () => {
    if (!isAuthenticated || !user) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const amountInSmallestUnit = BigInt(Math.floor(Number(amount) * 1_000_000));
      
      console.log(user.address, amountInSmallestUnit);
      const payload = await moneyFiAptos.getDepositTxPayload(user.address, amountInSmallestUnit);
      console.log(JSON.stringify(payload));
      const response = await signAndSubmitTransaction(payload);
      
      setMessage(`Deposit successful! Transaction: ${response}`);
      setAmount('');
    } catch (error) {
      console.error('Deposit failed:', error);
      setMessage(error instanceof Error ? error.message : 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root>
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold">
            Deposit USDC
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.500">
            Please connect your wallet to deposit USDC
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Card.Header>
        <Text fontSize="lg" fontWeight="semibold">
          Deposit USDC
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium">
              Amount (USDC)
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
            loading={isLoading}
            disabled={!amount || isLoading}
            colorScheme="blue"
            size="md"
          >
            {isLoading ? 'Depositing...' : 'Deposit'}
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