import React, { useState, useEffect } from 'react';
import { groupAndSortWallets, useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '@/provider/auth-provider';
import { APTOS_WALLET } from '@/constants/wallet';
import { Box, Button, DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogPositioner, DialogRoot, DialogTitle, Flex, HStack, Image, Spinner, Text, VStack } from '@chakra-ui/react';
import { isEqual, uniqWith } from 'lodash';
import { materialDesign3Theme } from '@/theme/material-design-3';
import { useThemeColors } from '@/provider/theme-provider';

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
  const { cardColors, buttonColors } = useThemeColors();
  
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
      borderColor={cardColors.border}
      borderRadius={materialDesign3Theme.borderRadius.sm}
      alignItems="center"
      justifyContent="space-between"
      opacity={isInstalled ? 1 : 0.7}
      _hover={{ bg: cardColors.background }}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      bg={cardColors.background}
    >
      <HStack gap={3}>
        <Box
          w="40px"
          h="40px"
          borderRadius={materialDesign3Theme.borderRadius.sm}
          bg="neutral.100"
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
            <Text
              fontSize={materialDesign3Theme.typography.labelMedium.fontSize}
              fontWeight="medium"
              color="neutral.600"
            >
              {wallet.name[0]}
            </Text>
          )}
        </Box>
        
        <VStack alignItems="flex-start" gap={0}>
          <Text
            fontWeight="medium"
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            color={cardColors.text}
          >
            {wallet.name}
          </Text>
          {!isInstalled && (
            <Text
              fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
              color={cardColors.textSecondary}
            >
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
        minH="36px"
        bg={isInstalled ? buttonColors.primary.background : cardColors.background}
        color={isInstalled ? buttonColors.primary.text : cardColors.textSecondary}
        borderRadius="xs"
        boxShadow={isInstalled ? "sm" : "none"}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        fontWeight="medium"
        fontSize="label-sm"
        _hover={{
          bg: isInstalled ? buttonColors.primary.hover : cardColors.border,
          color: isInstalled ? buttonColors.primary.text : cardColors.text,
          boxShadow: isInstalled ? "md" : "sm",
        }}
        _active={{
          bg: isInstalled ? buttonColors.primary.active : cardColors.border,
          boxShadow: isInstalled ? "sm" : "none",
        }}
        _loading={{
          bg: isInstalled ? buttonColors.primary.disabled : cardColors.border,
        }}
        _disabled={{
          bg: cardColors.border,
          color: cardColors.textSecondary,
          cursor: "not-allowed",
          boxShadow: "none",
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
  const { cardColors } = useThemeColors();
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
        <DialogContent
        maxW="md"
        mx={4}
        borderRadius={materialDesign3Theme.borderRadius.lg}
        boxShadow={materialDesign3Theme.elevation.level5}
        bg={cardColors.background}
      >
          <DialogHeader p={6}>
            <DialogTitle
              fontSize={materialDesign3Theme.typography.headlineSmall.fontSize}
              fontWeight="medium"
              color={cardColors.text}
            >
              Select Chain for MoneyFi
            </DialogTitle>
            <DialogCloseTrigger
              borderRadius={materialDesign3Theme.borderRadius.xs}
              _hover={{ bg: cardColors.border }}
            />
          </DialogHeader>

          <DialogBody px={6} pb={4}>
            <VStack gap={4} alignItems="stretch">
              <Text
                color={cardColors.textSecondary}
                fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
              >
                Select which chain to connect to your multi chain wallet
              </Text>

              {error && (
                <Box
                  p={4}
                  borderRadius={materialDesign3Theme.borderRadius.sm}
                  bg="error.50"
                  borderColor="error.200"
                  borderWidth="1px"
                >
                  <Text
                    color="error.700"
                    fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                    fontWeight="medium"
                  >
                    Connection Failed
                  </Text>
                  <Text
                    color="error.600"
                    fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  >
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
                    <Spinner size="sm" color="primary.500" />
                    <Text
                      fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                      color="neutral.600"
                    >
                      Opening wallet popup...
                    </Text>
                  </HStack>
                </Flex>
              )}

              {availableWallets.length === 0 && installableWallets.length === 0 && (
                <Box p={4} textAlign="center">
                  <Text
                    color="neutral.500"
                    fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  >
                    No wallets detected. Please install a wallet extension.
                  </Text>
                </Box>
              )}
            </VStack>
          </DialogBody>

          <DialogFooter p={6}>
            <Button
              onClick={onClose}
              w="full"
              bg="neutral.100"
              color="neutral.700"
              border="1px solid"
              borderColor="neutral.300"
              borderRadius="sm"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              fontWeight="medium"
              fontSize="label-lg"
              minH="40px"
              _hover={{
                bg: "neutral.200",
                borderColor: "neutral.400",
              }}
              _active={{
                bg: "neutral.300",
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