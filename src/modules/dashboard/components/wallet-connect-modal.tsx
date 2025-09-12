import React, { useState, useEffect } from 'react';
import { groupAndSortWallets, useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '@/provider/auth-provider';
import { APTOS_WALLET } from '@/constants/wallet';
import { Box, Button, DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogPositioner, DialogRoot, DialogTitle, Flex, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react';
import { isEqual, uniqWith } from 'lodash';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletOptionProps {
  wallet: {
    name: string;
    icon: string;
    url: string;
  };
  onConnect: (walletName: string) => void;
  onInstall: (walletName: string, walletUrl: string) => void;
  isConnecting: boolean;
  isInstalled?: boolean;
}

// Mapping wallet names to their Aptos adapter names
// const WALLET_ADAPTER_NAMES = {
//   'OKX Wallet': 'OKX Wallet',
//   'Petra': 'Petra',
//   'Nightly': 'Nightly',
//   'Pontem': 'Pontem Wallet',
// } as const;

// Wallet icons mapping (you can replace these with actual icon URLs)
// const WALLET_ICONS = {
//   'OKX Wallet': '/wallet-icons/okx.png',
//   'Petra': '/wallet-icons/petra.png',
//   'Nightly': '/wallet-icons/nightly.png',
//   'Pontem': '/wallet-icons/pontem.png',
// } as const;

const WalletOption: React.FC<WalletOptionProps> = ({
  wallet,
  onConnect,
  onInstall,
  isConnecting,
  isInstalled = false,
}) => {
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  
  const handleAction = async () => {
    if (isInstalled) {
      setIsLocalLoading(true);
      try {
        await onConnect(wallet.name);
      } finally {
        setIsLocalLoading(false);
      }
    } else {
      onInstall(wallet.name, wallet.url);
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
      _hover={{ bg: "gray.800" }}
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
          {wallet.icon ? (
            <Image
              src={wallet.icon}
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
        onClick={handleAction}
        loading={isLocalLoading || (isConnecting && isInstalled)}
        minW="80px"
        bg={isInstalled ? "green.400" : "gray.100"}
        color={isInstalled ? "white" : "gray.700"}
        border="2px solid black"
        borderRadius="0"
        boxShadow="3px 3px 0px black"
        transition="all 0.3s ease"
        fontWeight="bold"
        fontSize="xs"
        _hover={{ 
          bg: isInstalled ? "green.500" : "gray.200",
          color: isInstalled ? "white" : "black",
          transform: "translate(1px, 1px)",
          boxShadow: "2px 2px 0px black"
        }}
        _active={{
          transform: "translate(2px, 2px)",
          boxShadow: "1px 1px 0px black"
        }}
        _loading={{
          bg: isInstalled ? "green.300" : "gray.200",
          transform: "none",
          boxShadow: "3px 3px 0px black"
        }}
        _disabled={{
          bg: "gray.200",
          color: "gray.500",
          cursor: "not-allowed",
          transform: "none",
          boxShadow: "3px 3px 0px #666"
        }}
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
};const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { signIn, isConnecting, error, clearError, isAuthenticated } = useAuth();
  const { wallets = [], notDetectedWallets = [] } = useWallet();
  const { availableWallets, installableWallets } = groupAndSortWallets([...wallets, ...notDetectedWallets]);

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
      await signIn(walletName);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleWalletInstall = (walletName: string, walletInstallUrl: string) => {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile && !(window as any).aptos) {
      if (walletName === APTOS_WALLET.OKX.name) {
        const host = window.location.host;
        const dappUrl = `https://${host}`;
        window.location.href = `${APTOS_WALLET.OKX.url}${encodeURIComponent("okx://wallet/dapp/url?dappUrl=" + encodeURIComponent(dappUrl))}`;
        return;
      }
      if (walletName === APTOS_WALLET.PETRA.name) {
        const host = window.location.host;
        const dappUrl = `https://${host}`;
        window.location.href = `${APTOS_WALLET.PETRA.url}${dappUrl}`;
        return;
      }
      if (walletName === APTOS_WALLET.NIGHTLY.name) {
        const host = window.location.host;
        const dappUrl = `https://${host}`;
        const encodedDappUrl = encodeURIComponent(dappUrl);
        window.location.href = `${APTOS_WALLET.NIGHTLY.url}${encodedDappUrl}`;
        return;
      }
      if (walletName === APTOS_WALLET.PONTEM.name) {
        const host = window.location.host;
        const dappUrl = `https://${host}`;
        window.location.href = `${APTOS_WALLET.PONTEM.url}${dappUrl}`;
        return;
      }
    }
    window.open(walletInstallUrl, "_blank");
  };

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
                {uniqWith(availableWallets, isEqual).map((wallet: any) => (
                  <WalletOption
                    key={wallet.name}
                    wallet={{
                      name: wallet.name,
                      icon: wallet.icon,
                      url: wallet.url,
                    }}
                    onConnect={handleWalletConnect}
                    onInstall={handleWalletInstall}
                    isConnecting={isConnecting}
                    isInstalled={true}
                  />
                ))}

                {installableWallets.map((wallet: any) => (
                  <WalletOption
                    key={wallet.name}
                    wallet={{
                      name: wallet.name,
                      icon: wallet.icon,
                      url: wallet.url,
                    }}
                    onConnect={handleWalletConnect}
                    onInstall={handleWalletInstall}
                    isConnecting={isConnecting}
                    isInstalled={false}
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

              {availableWallets.length === 0 && installableWallets.length === 0 && (
                <Box p={4} textAlign="center">
                  <Text color="gray.500" fontSize="sm">
                    No wallets detected. Please install a wallet extension.
                  </Text>
                </Box>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter>
            <Button 
              onClick={onClose} 
              w="full"
              bg="white"
              color="gray.700"
              border="2px solid black"
              borderRadius="0"
              boxShadow="3px 3px 0px black"
              transition="all 0.3s ease"
              fontWeight="bold"
              _hover={{ 
                bg: "gray.100",
                color: "black",
                transform: "translate(1px, 1px)",
                boxShadow: "2px 2px 0px black"
              }}
              _active={{
                transform: "translate(2px, 2px)",
                boxShadow: "1px 1px 0px black"
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

export default WalletConnectModal;