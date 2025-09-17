import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";

export default function CheckWalletAccount() {
  const { isAuthenticated, user, signOut, error } = useAuth();
  const { data: hasWalletAccount, isLoading: isCheckingAccount } = useCheckWalletAccountQuery();
  const { cardColors, colors, buttonColors } = useThemeColors();

  const handleDisconnectWallet = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <Card.Root
      bg={cardColors.background}
      border="1px solid"
      borderColor={cardColors.border}
      borderRadius={materialDesign3Theme.borderRadius.md}
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
              Wallet Connection
            </Text>
            {isAuthenticated && (
              <Badge
                colorScheme="green"
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
          {!isAuthenticated ? (
            <VStack align="stretch" gap={3}>
              <Alert.Root status="info">
                <Alert.Description>
                  Connect your wallet to access MoneyFi features
                </Alert.Description>
              </Alert.Root>
              
              <Text fontSize="sm" color={cardColors.textSecondary} textAlign="center">
                Supported wallets: Petra, Martian, Pontem, Fewcha
              </Text>
              
              {error && (
                <Alert.Root status="error">
                  <Alert.Description>
                    {error}
                  </Alert.Description>
                </Alert.Root>
              )}
            </VStack>
          ) : (
            <VStack align="stretch" gap={3}>
              <Alert.Root status="success">
                <Alert.Description>
                  Wallet successfully connected
                </Alert.Description>
              </Alert.Root>
              
              {user && (
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" color={cardColors.textSecondary}>
                    Connected Wallet:
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color={cardColors.text} fontFamily="mono">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </Text>
                  {user.walletName && (
                    <Text fontSize="sm" color={cardColors.textSecondary}>
                      Wallet: {user.walletName}
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
                        colorScheme={hasWalletAccount ? "green" : "orange"}
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
