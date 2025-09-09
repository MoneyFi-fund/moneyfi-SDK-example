import React from 'react';
import {
  Dialog as Modal,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Box,
  Spinner,
  Alert,
} from '@chakra-ui/react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from './AuthProvider';
import { Close, Wallet } from '@mui/icons-material';

interface WalletSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  isOpen,
  onClose,
  title = 'Connect Your Wallet',
  subtitle = 'Choose a wallet to connect to MoneyFi',
}) => {
  const { wallets } = useWallet();
  const { signIn, isConnecting, error } = useAuth();

  const handleWalletSelect = async (walletName: string) => {
    try {
      await signIn(walletName);
      onClose();
    } catch (error) {
      // Error is handled by AuthProvider
    }
  };

  const getWalletIcon = (walletName: string): string => {
    // Default wallet icons - these would typically come from the wallet adapter
    const walletIcons: Record<string, string> = {
      'Petra': 'https://petra.app/favicon.ico',
      'Martian': 'https://martianwallet.xyz/favicon.ico',
      'Pontem': 'https://pontem.network/favicon.ico',
      'Fewcha': 'https://fewcha.app/favicon.ico',
      'Rise': 'https://risewallet.io/favicon.ico',
      'Fletch': 'https://fletchwallet.io/favicon.ico',
      'TokenPocket': 'https://tokenpocket.pro/favicon.ico',
      'Trust Wallet': 'https://trustwallet.com/favicon.ico',
      'OKX': 'https://okx.com/favicon.ico',
    };

    return walletIcons[walletName] || `https://api.dicebear.com/7.x/identicon/svg?seed=${walletName}`;
  };

  return (
    <Modal.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Modal.Backdrop />
      <Modal.Content maxW="md" mx={4}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          <Modal.CloseTrigger asChild>
            <Button variant="ghost" size="sm">
              <Close />
            </Button>
          </Modal.CloseTrigger>
        </Modal.Header>

        <Modal.Body>
          <VStack gap={4} align="stretch">
            {subtitle && (
              <Text color="gray.600" textAlign="center">
                {subtitle}
              </Text>
            )}

            {error && (
              <Alert status="error" borderRadius="md">
                <VStack align="start" gap={1}>
                  <Text fontWeight="medium">Connection Failed</Text>
                  <Text fontSize="sm">{error}</Text>
                </VStack>
              </Alert>
            )}

            <VStack gap={3} align="stretch">
              {wallets.length === 0 ? (
                <VStack py={8} gap={3}>
                  <Wallet color="gray.400" fontSize="large" />
                  <Text color="gray.500" textAlign="center">
                    No wallets detected. Please install a supported Aptos wallet.
                  </Text>
                  <Button
                    as="a"
                    href="https://petra.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                  >
                    Get Petra Wallet
                  </Button>
                </VStack>
              ) : (
                wallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    size="lg"
                    height="auto"
                    py={4}
                    onClick={() => handleWalletSelect(wallet.name)}
                    disabled={isConnecting || !wallet.readyState}
                    justifyContent="flex-start"
                    _hover={{
                      borderColor: 'blue.500',
                      bg: 'blue.50',
                    }}
                  >
                    <HStack gap={4} flex={1} minW={0}>
                      <Box flexShrink={0}>
                        <Image
                          src={wallet.icon || getWalletIcon(wallet.name)}
                          alt={`${wallet.name} logo`}
                          boxSize="40px"
                          borderRadius="md"
                          fallback={
                            <Box
                              boxSize="40px"
                              borderRadius="md"
                              bg="gray.100"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Wallet color="gray.400" />
                            </Box>
                          }
                        />
                      </Box>

                      <VStack align="start" gap={0} flex={1} minW={0}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="medium" fontSize="md">
                            {wallet.name}
                          </Text>
                          {isConnecting && (
                            <Spinner size="sm" color="blue.500" />
                          )}
                        </HStack>
                        
                        <Text 
                          fontSize="sm" 
                          color="gray.500"
                          noOfLines={1}
                        >
                          {wallet.readyState === 'Installed' ? 'Ready to connect' : 'Not installed'}
                        </Text>
                      </VStack>
                    </HStack>
                  </Button>
                ))
              )}
            </VStack>

            <VStack gap={2} pt={4} borderTop="1px" borderColor="gray.200">
              <Text fontSize="xs" color="gray.500" textAlign="center">
                By connecting a wallet, you agree to MoneyFi's Terms of Service and Privacy Policy
              </Text>
            </VStack>
          </VStack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};