import React, { useState, useEffect } from 'react';
import {
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Spinner,
  Box,
  Flex,
} from '@chakra-ui/react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '@/providers/auth-provider';
import { APTOS_WALLET } from '@/constants/wallet';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletInfo {
  name: string;
  deepLink: string | null;
  url: string;
  isInstalled?: boolean;
  aptosWalletName?: string; // The actual wallet name used by Aptos adapter
}

interface WalletOptionProps {
  wallet: WalletInfo;
  onConnect: (walletName: string) => void;
  onInstall: (url: string) => void;
  isConnecting: boolean;
}

// Mapping wallet names to their Aptos adapter names
const WALLET_ADAPTER_NAMES = {
  'OKX Wallet': 'OKX Wallet',
  'Petra': 'Petra',
  'Nightly': 'Nightly',
  'Pontem': 'Pontem Wallet',
} as const;

// Wallet icons mapping (you can replace these with actual icon URLs)
const WALLET_ICONS = {
  'OKX Wallet': '/wallet-icons/okx.png',
  'Petra': '/wallet-icons/petra.png',
  'Nightly': '/wallet-icons/nightly.png',
  'Pontem': '/wallet-icons/pontem.png',
} as const;

const WalletOption: React.FC<WalletOptionProps> = ({
  wallet,
  onConnect,
  onInstall,
  isConnecting,
}) => {
  const isInstalled = wallet.isInstalled;
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleAction = async () => {
    if (isInstalled && wallet.aptosWalletName) {
      setIsLocalLoading(true);
      try {
        await onConnect(wallet.aptosWalletName);
      } finally {
        setIsLocalLoading(false);
      }
    } else {
      onInstall(wallet.url);
    }
  };

  return (
    <Flex
      p={4}
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      alignItems="center"
      justifyContent="space-between"
      opacity={isInstalled ? 1 : 0.7}
      _hover={{ bg: "gray.50" }}
      transition="all 0.2s"
    >
      <HStack gap={3}>
        <Box
          w="40px"
          h="40px"
          borderRadius="lg"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          {WALLET_ICONS[wallet.name as keyof typeof WALLET_ICONS] ? (
            <Image
              src={WALLET_ICONS[wallet.name as keyof typeof WALLET_ICONS]}
              alt={wallet.name}
              w="32px"
              h="32px"
            />
          ) : (
            <Text fontSize="sm" fontWeight="bold" color="gray.600">
              {wallet.name[0]}
            </Text>
          )}
        </Box>
        
        <VStack alignItems="flex-start" gap={0}>
          <Text fontWeight="medium" fontSize="md">
            {wallet.name}
          </Text>
          {!isInstalled && (
            <Text fontSize="sm" color="gray.500">
              Not installed
            </Text>
          )}
        </VStack>
      </HStack>

      <Button
        size="sm"
        colorScheme={isInstalled ? "green" : "gray"}
        variant={isInstalled ? "solid" : "outline"}
        onClick={handleAction}
        loading={isLocalLoading || (isConnecting && isInstalled)}
        minW="80px"
      >
        {isLocalLoading || (isConnecting && isInstalled) 
          ? "Connecting..." 
          : isInstalled 
            ? "Connect" 
            : "Install"
        }
      </Button>
    </Flex>
  );
};

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { signIn, isConnecting, error, clearError, isAuthenticated } = useAuth();
  const { wallets } = useWallet();

  // Close modal when authentication succeeds
  useEffect(() => {
    if (isAuthenticated) {
      onClose();
    }
  }, [isAuthenticated, onClose]);

  // Clear error when modal closes
  useEffect(() => {
    if (!isOpen) {
      clearError();
    }
  }, [isOpen, clearError]);

  const handleWalletConnect = async (walletName: string) => {
    try {
      console.log(`Attempting to connect to wallet: ${walletName}`);
      await signIn(walletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleWalletInstall = (url: string) => {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // On mobile, try to use deep links or redirect to app stores
      window.location.href = url;
    } else {
      // On desktop, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Create a map of installed wallet names for quick lookup
  const installedWalletNames = new Set(wallets.map(w => w.name));
  
  // Prepare wallet list with installation status
  const walletList = Object.entries(APTOS_WALLET).map(([_, walletConfig]) => {
    const aptosWalletName = WALLET_ADAPTER_NAMES[walletConfig.name as keyof typeof WALLET_ADAPTER_NAMES];
    
    return {
      ...walletConfig,
      aptosWalletName,
      isInstalled: installedWalletNames.has(aptosWalletName),
    };
  });

  return (
    <DialogRoot open={isOpen} onOpenChange={(details) => !details.open && onClose()}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="md" mx={4}>
          <DialogHeader>
            <DialogTitle fontSize="xl" fontWeight="bold">
              Select Chain for MoneyFi
            </DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>

          <DialogBody pb={6}>
            <VStack gap={4} alignItems="stretch">
              <Text color="gray.600" fontSize="sm">
                Select which chain to connect to your multi chain wallet
              </Text>

              {error && (
                <Box
                  p={4}
                  borderRadius="md"
                  bg="red.50"
                  borderColor="red.200"
                  borderWidth="1px"
                >
                  <Text color="red.700" fontSize="sm" fontWeight="medium">
                    Connection Failed
                  </Text>
                  <Text color="red.600" fontSize="sm">
                    {error}
                  </Text>
                </Box>
              )}

              <VStack gap={3} alignItems="stretch">
                {walletList.map((wallet) => (
                  <WalletOption
                    key={wallet.name}
                    wallet={wallet}
                    onConnect={handleWalletConnect}
                    onInstall={handleWalletInstall}
                    isConnecting={isConnecting}
                  />
                ))}
              </VStack>

              {isConnecting && (
                <Flex alignItems="center" justifyContent="center" p={4}>
                  <HStack gap={3}>
                    <Spinner size="sm" color="blue.500" />
                    <Text fontSize="sm" color="gray.600">
                      Opening wallet popup...
                    </Text>
                  </HStack>
                </Flex>
              )}

              {walletList.length === 0 && (
                <Box p={4} textAlign="center">
                  <Text color="gray.500" fontSize="sm">
                    No wallets detected. Please install a wallet extension.
                  </Text>
                </Box>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} w="full">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default WalletConnectModal;