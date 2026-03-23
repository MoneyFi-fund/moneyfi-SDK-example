import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useAptos } from "@/provider/aptos-provider";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";

export default function CheckWalletAccount() {
  const { address, isConnected, walletName, disconnect } = useAptos();
  const { data: hasWalletAccount, isLoading: isCheckingAccount } = useCheckWalletAccountQuery();
  const { cardColors, colors, buttonColors, isDark } = useThemeColors();

  const handleDisconnectWallet = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <Card.Root
      bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
      backdropFilter={isDark ? 'blur(10px)' : 'none'}
      css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
      border="1px solid"
      borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
      borderRadius="16px"
      boxShadow={materialDesign3Theme.elevation.level1}
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        boxShadow: materialDesign3Theme.elevation.level2,
      }}
    >
      <Card.Header>
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center" width="100%">
            <Text fontSize="lg" fontWeight="semibold" color={cardColors.text}>
              Aptos Wallet
            </Text>
            {isConnected && (
              <Badge
                bg={isDark ? 'rgba(57,255,20,0.15)' : 'rgba(31,174,92,0.15)'}
                color={isDark ? '#39FF14' : '#1FAE5C'}
                variant="subtle"
                fontSize="xs"
                py={1}
                borderRadius="md"
              >
                <Text>Connected</Text>
              </Badge>
            )}
          </HStack>
        </VStack>
      </Card.Header>
      
      <Card.Body>
        <VStack align="stretch" gap={4}>
          {!isConnected ? (
            <VStack align="stretch" gap={3}>
              <Alert.Root status="info">
                <Alert.Description>
                  Connect your Aptos wallet to access MoneyFi features
                </Alert.Description>
              </Alert.Root>

              <Text fontSize="sm" color={cardColors.textSecondary} textAlign="center">
                Supported wallets: Petra, Martian, Pontem, Fewcha
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" gap={3}>
              <Alert.Root status="success">
                <Alert.Description>
                  Aptos wallet connected
                </Alert.Description>
              </Alert.Root>

              {address && (
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" color={cardColors.textSecondary}>
                    Connected Wallet:
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color={cardColors.text} fontFamily="'JetBrains Mono', monospace">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </Text>
                  {walletName && (
                    <Text fontSize="sm" color={cardColors.textSecondary}>
                      Wallet: {walletName}
                    </Text>
                  )}
                  
                  <VStack align="stretch" gap={1} mt={2}>
                    <Text fontSize="sm" color={cardColors.textSecondary}>
                      MoneyFi Account Status:
                    </Text>
                    {isCheckingAccount ? (
                      <Text fontSize="sm" color="warning.400">
                        Checking account...
                      </Text>
                    ) : (
                      <Badge
                        bg={
                          hasWalletAccount
                            ? isDark ? 'rgba(57,255,20,0.15)' : 'rgba(31,174,92,0.15)'
                            : isDark ? 'rgba(255,184,0,0.15)' : 'rgba(217,119,6,0.15)'
                        }
                        color={
                          hasWalletAccount
                            ? isDark ? '#39FF14' : '#1FAE5C'
                            : isDark ? '#FFB800' : '#D97706'
                        }
                        variant="subtle"
                        fontSize="xs"
                        py={1}
                        borderRadius="md"
                        width="fit-content"
                      >
                        <Text>
                          {hasWalletAccount ? "Account Found" : "Account Not Found"}
                        </Text>
                      </Badge>
                    )}
                  </VStack>
                </VStack>
              )}
              
              <Button
                onClick={handleDisconnectWallet}
                bg={buttonColors.error.background}
                color={buttonColors.error.text}
                minH="48px"
                px={6}
                borderRadius="sm"
                fontWeight="medium"
                fontSize="label-lg"
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                boxShadow="sm"
                _hover={{
                  bg: buttonColors.error.hover,
                  boxShadow: "md",
                }}
                _active={{
                  bg: buttonColors.error.active,
                  boxShadow: "sm",
                }}
                _disabled={{
                  bg: buttonColors.error.disabled,
                  color: colors.onSurfaceVariant,
                  boxShadow: "none",
                  cursor: "not-allowed",
                }}
              >
                Disconnect Wallet
              </Button>
            </VStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
