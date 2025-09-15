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
import { useCheckWalletAccountQuery } from "@/api/use-check-wallet-account";
export default function CheckWalletAccount() {
  const { isAuthenticated, user, signIn, signOut, error } = useAuth();
  const { data: hasWalletAccount, isLoading: isCheckingAccount } = useCheckWalletAccountQuery();

  const handleConnectWallet = async (walletName: string) => {
    try {
      await signIn(walletName);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  return (
    <Card.Root
      bg="black"
      border="2px solid white"
      borderRadius="0"
      boxShadow="4px 4px 0px white"
      transition="all 0.3s ease"
      _hover={{
        transform: "translate(-1px, -1px)",
        boxShadow: "5px 5px 0px white",
      }}
    >
      <Card.Header>
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center" width="100%">
            <Text fontSize="lg" fontWeight="semibold" color="white">
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
              
              <Text fontSize="sm" color="gray.400" textAlign="center">
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
                  <Text fontSize="sm" color="gray.400">
                    Connected Wallet:
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="white" fontFamily="mono">
                    {user.address.slice(0, 6)}...{user.address.slice(-4)}
                  </Text>
                  {user.walletName && (
                    <Text fontSize="sm" color="gray.400">
                      Wallet: {user.walletName}
                    </Text>
                  )}
                  
                  <VStack align="stretch" gap={1} mt={2}>
                    <Text fontSize="sm" color="gray.400">
                      MoneyFi Account Status:
                    </Text>
                    {isCheckingAccount ? (
                      <Text fontSize="sm" color="yellow.400">
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
                size="md"
                bg="red.600"
                color="white"
                border="2px solid white"
                borderRadius="0"
                boxShadow="3px 3px 0px white"
                transition="all 0.3s ease"
                fontWeight="bold"
                _hover={{
                  bg: "red.500",
                  color: "white",
                  transform: "translate(-1px, -1px)",
                  boxShadow: "4px 4px 0px white",
                }}
                _active={{
                  transform: "translate(1px, 1px)",
                  boxShadow: "2px 2px 0px white",
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
