import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Card,
  Stat,
  SimpleGrid,
  Button,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { WalletConnectModal } from "@/components/wallet/WalletConnectModal";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { usePortfolio } from "@/hooks/useAssets";
import { useWalletService } from "@/hooks/useWalletService";
import { useState } from "react";

export const DashboardPage = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const walletService = useWalletService();
  const walletState = walletService?.getState() || {
    isConnected: false,
    isConnecting: false,
    account: null,
    walletName: null,
    error: null,
  };
  const { isConnected } = walletState;
  const { portfolio, loading: portfolioLoading } = usePortfolio();

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Box minH="100vh" bg="bg">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid" borderColor="border" py={4}>
        <Container maxW="7xl">
          <HStack justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold" color="black">
              MoneyFi SDK Demo
            </Text>
            <WalletButton onConnectClick={() => setIsWalletModalOpen(true)} />
          </HStack>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={8}>
        <VStack gap={8} align="stretch">
          {!isConnected ? (
            <VStack gap={6} align="center" justify="center" minH="60vh">
              <Dialog.Root open={true}>
                <Portal>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content maxW="md">
                      <Dialog.Header>
                        <Dialog.Title textAlign="center">Welcome to MoneyFi SDK</Dialog.Title>
                      </Dialog.Header>
                      <Dialog.Body>
                        <VStack gap={4} align="center">
                          <Text textAlign="center" color="fg.secondary">
                            Connect your Aptos wallet to get started with the comprehensive wallet connector demo.
                            This demo showcases wallet connection management, asset portfolio display, and vault operations.
                          </Text>
                          <Button 
                            size="lg"
                            colorScheme="blue"
                            onClick={() => setIsWalletModalOpen(true)}
                            px={8}
                            py={6}
                            fontSize="lg"
                            fontWeight="semibold"
                          >
                            Connect Your Wallet
                          </Button>
                        </VStack>
                      </Dialog.Body>
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Portal>
              </Dialog.Root>
            </VStack>
          ) : (
            <>
              {/* Portfolio Overview */}
              <VStack gap={4} align="stretch">
                <Text fontSize="xl" fontWeight="semibold">
                  Portfolio Overview
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
                  <Card.Root>
                    <Card.Body>
                      <Stat.Root>
                        <Stat.Label>Total Portfolio Value</Stat.Label>
                        <Stat.ValueText>
                          {portfolioLoading 
                            ? "Loading..." 
                            : formatCurrency(portfolio.totalUsdValue)
                          }
                        </Stat.ValueText>
                        <Stat.HelpText>Wallet + Vault balances</Stat.HelpText>
                      </Stat.Root>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root>
                    <Card.Body>
                      <Stat.Root>
                        <Stat.Label>Vault Value</Stat.Label>
                        <Stat.ValueText>
                          {portfolioLoading 
                            ? "Loading..." 
                            : formatCurrency(portfolio.totalVaultValue)
                          }
                        </Stat.ValueText>
                        <Stat.HelpText>Assets in vault</Stat.HelpText>
                      </Stat.Root>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root>
                    <Card.Body>
                      <Stat.Root>
                        <Stat.Label>Total Assets</Stat.Label>
                        <Stat.ValueText>
                          {portfolioLoading 
                            ? "Loading..." 
                            : portfolio.assetCount.toString()
                          }
                        </Stat.ValueText>
                        <Stat.HelpText>Unique tokens</Stat.HelpText>
                      </Stat.Root>
                    </Card.Body>
                  </Card.Root>

                  <Card.Root>
                    <Card.Body>
                      <Stat.Root>
                        <Stat.Label>Vault Assets</Stat.Label>
                        <Stat.ValueText>
                          {portfolioLoading 
                            ? "Loading..." 
                            : portfolio.vaultAssetCount.toString()
                          }
                        </Stat.ValueText>
                        <Stat.HelpText>Deposited tokens</Stat.HelpText>
                      </Stat.Root>
                    </Card.Body>
                  </Card.Root>
                </SimpleGrid>
              </VStack>

              {/* Assets Section */}
              <AssetGrid showVaultAssets={true} showActions={true} />
            </>
          )}

          {/* Features Info */}
          <Card.Root>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="semibold">
                  SDK Features Demonstrated
                </Text>
                
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  <Box p={4} bg="brand.50" borderRadius="md">
                    <Text fontWeight="medium" color="brand.700" mb={2}>
                      Wallet Management
                    </Text>
                    <Text fontSize="sm" color="brand.600">
                      Enhanced wallet connection with persistent state, auto-reconnection, and comprehensive error handling
                    </Text>
                  </Box>
                  
                  <Box p={4} bg="green.50" borderRadius="md">
                    <Text fontWeight="medium" color="green.700" mb={2}>
                      Transaction Lifecycle
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      Complete transaction management from building to monitoring with real-time status updates
                    </Text>
                  </Box>
                  
                  <Box p={4} bg="purple.50" borderRadius="md">
                    <Text fontWeight="medium" color="purple.700" mb={2}>
                      Asset Management
                    </Text>
                    <Text fontSize="sm" color="purple.600">
                      Reactive asset balance tracking with automatic caching and subscription-based updates
                    </Text>
                  </Box>
                  
                  <Box p={4} bg="orange.50" borderRadius="md">
                    <Text fontWeight="medium" color="orange.700" mb={2}>
                      Contract Interactions
                    </Text>
                    <Text fontSize="sm" color="orange.600">
                      High-level smart contract integration for vault operations with validation and error handling
                    </Text>
                  </Box>
                  
                  <Box p={4} bg="blue.50" borderRadius="md">
                    <Text fontWeight="medium" color="blue.700" mb={2}>
                      Performance Optimization
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                      Request deduplication, caching strategies, and performance monitoring for optimal user experience
                    </Text>
                  </Box>
                  
                  <Box p={4} bg="red.50" borderRadius="md">
                    <Text fontWeight="medium" color="red.700" mb={2}>
                      Error Handling
                    </Text>
                    <Text fontSize="sm" color="red.600">
                      Comprehensive error categorization, retry logic, and user-friendly error messaging
                    </Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>

      {/* Wallet Connect Modal */}
      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </Box>
  );
};