import React, { useState, useMemo } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
  Link,
  HStack,
  Input,
  Portal,
  Select,
  createListCollection,
  Spinner,
} from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useAuth } from "@/provider/auth-provider";
import { useEVM } from "@/provider/evm-provider";
import { useThemeColors } from "@/provider/theme-provider";
import { useEVMWithdrawMutation, useGetSupportedChains, useGetSupportedTokens, evmQueryKeys } from "@/hooks/evm/use-moneyfi-evm-queries";
import { useGetMaxQuoteQuery, maxQuoteQueryKeys } from "@/hooks/use-get-max-quote";
import { useQueryClient } from "@tanstack/react-query";
import { CHAIN_ID_MAP } from "@/config/chains";
import { getExplorerUrl } from "@/hooks/common/get-explorer-url";
import { useGetBridgeStatusQuery } from "@/hooks/common/use-bridge-status";
import { statsQueryKeys } from "@/hooks/common";

export const EVMWithdrawComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { address: evmAddress, isConnected: isEVMConnected } = useEVM();
  const { cardColors, buttonColors, isDark } = useThemeColors();
  const queryClient = useQueryClient();

  // Form state
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"idle" | "withdrawing">("idle");
  const [pollingStatus, setPollingStatus] = useState<string | null>(null);


  // Fetch supported chains and tokens
  const { data: supportedChains, isLoading: isChainsLoading } =
    useGetSupportedChains();

  // Get chain ID from selected chain name using CHAIN_ID_MAP
  const selectedChainId = selectedChain ? CHAIN_ID_MAP[selectedChain] : undefined;

  // Get explorer URL for transaction
  const getTransactionExplorerUrl = (txHash: string) => {
    if (!selectedChainId) return null;
    return getExplorerUrl(selectedChainId, txHash);
  };

  // Fetch tokens for the selected chain ID
  const { data: supportedTokens, isLoading: isTokensLoading } =
    useGetSupportedTokens();

  // Fetch max quote for withdrawal using EVM wallet address
  const { data: maxQuoteData, isLoading: isMaxQuoteLoading } = useGetMaxQuoteQuery(
    evmAddress ? { address: evmAddress } : null
  );

  // Calculate max withdraw amount based on selected chain and token
  const maxWithdrawAmount = useMemo(() => {
    if (!maxQuoteData || !selectedChain || !selectedToken) return 0;
    console.log(maxQuoteData, selectedChain, selectedToken);
    // @ts-ignore
    const quoteArray = Array.isArray(maxQuoteData) ? maxQuoteData : maxQuoteData?.data;
    if (!Array.isArray(quoteArray)) return 0;
    const chainData = quoteArray.find(
      (item: { chain_id: string; usdc: number }) => item.chain_id.toLowerCase() === selectedChain.toLowerCase()
    );

    if (!chainData) return 0;
    return chainData.usdc ? Number(chainData.usdc) / 1e6 : 0;
  }, [maxQuoteData, selectedChain, selectedToken]);

  const handleMaxAmount = () => {
    if (maxWithdrawAmount > 0) {
      setAmount(maxWithdrawAmount.toString());
    }
  };

  // Parse chains into selectable format (Mainnet displays as Ethereum)
  const chainsList = useMemo(() => {
    if (!supportedChains) return [];
    return Array.isArray(supportedChains)
      ? supportedChains.map((chain: any) => ({
          label: chain.name === "Mainnet" ? "Ethereum" : (chain.name || String(chain.id)),
          value: chain.name || String(chain.id),
        }))
      : [];
  }, [supportedChains]);

  const tokensList = useMemo(() => {
    if (!supportedTokens) return [];
    
    const filteredTokens = selectedChain
      ? supportedTokens.tokens.filter((token: any) => token.chain === selectedChain)
      : supportedTokens.tokens;
    
    return filteredTokens.map((token: any) => ({
      label: token.name,
      value: token.address || "",
    }));
  }, [supportedTokens, selectedChain]);

  const chainsCollection = createListCollection({
    items: chainsList,
  });

  const tokensCollection = createListCollection({
    items: tokensList,
  });


  const withdrawMutation = useEVMWithdrawMutation({
    chainId: selectedChainId || 0,
    onStatusChange: setPollingStatus,
  });

  // Poll bridge status for the transaction
  const { data: bridgeStatus, isLoading: isBridgeStatusLoading } = useGetBridgeStatusQuery(
    successData?.hash,
    !!successData?.hash
  );

  const handleWithdraw = async () => {
    if (!amount || !selectedChain || !evmAddress) {
      setStepError("Please connect your EVM wallet first");
      return;
    }

    setSuccessData(null);
    setStepError(null);
    setPollingStatus(null);

    try {
      setCurrentStep("withdrawing");

      await new Promise<any>((resolve, reject) => {
        withdrawMutation.mutate(
          { amount: Number(amount), tokenAddress: selectedToken },
          {
            onSuccess: async (data: any) => {
              // Invalidate balance queries
              queryClient.invalidateQueries({
                queryKey: evmQueryKeys.balance(selectedChain, evmAddress),
              });

              // Invalidate user statistics
              queryClient.invalidateQueries({
                queryKey: statsQueryKeys.user(evmAddress),
              });

              // Invalidate max quote data
              queryClient.invalidateQueries({
                queryKey: maxQuoteQueryKeys.quote(evmAddress),
              });

              setAmount("");
              setSuccessData({ hash: data?.txHash || "pending" });
              setCurrentStep("idle");
              // Keep the final status to show "done" state
              setPollingStatus("done");
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setStepError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setCurrentStep("idle");
      setPollingStatus(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root
        bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(10px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        border="1px solid"
        borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
        borderRadius="16px"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          boxShadow: isDark ? '0 0 20px rgba(57,255,20,0.15)' : 'md',
        }}
      >
        <Card.Header p={6}>
          <Text
            fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
            lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
            fontWeight="medium"
            color={cardColors.text}
          >
            Withdraw Funds (EVM)
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <Text
            color={cardColors.textSecondary}
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            Please connect your wallet (Aptos or EVM) to withdraw funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Show warning if authenticated but EVM wallet not connected
  if (!isEVMConnected) {
    return (
      <Card.Root
        bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(10px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        border="1px solid"
        borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
        borderRadius="16px"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          boxShadow: isDark ? '0 0 20px rgba(57,255,20,0.15)' : 'md',
        }}
      >
        <Card.Header p={6}>
          <Text
            fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
            lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
            fontWeight="medium"
            color={cardColors.text}
          >
            Withdraw Funds (EVM)
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <Text
            color={cardColors.textSecondary}
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            Please connect your EVM wallet (MetaMask) in header to withdraw funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
      backdropFilter={isDark ? 'blur(10px)' : 'none'}
      css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
      border="1px solid"
      borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
      borderRadius="16px"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        boxShadow: isDark ? '0 0 20px rgba(57,255,20,0.15)' : 'md',
      }}
    >
      <Card.Header p={6}>
        <Text
          fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
          lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
          fontWeight="medium"
          color={cardColors.text}
        >
          Withdraw Funds (EVM)
        </Text>
      </Card.Header>
      <Card.Body px={6} pb={6}>
        <VStack align="stretch" gap={6}>
          
          {/* Chain Selector */}
          <VStack align="stretch" gap={2}>
            <Text
              fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
              fontWeight="medium"
              color={cardColors.textSecondary}
            >
              Network
            </Text>
            {isChainsLoading ? (
              <HStack p={4} justify="center">
                <Spinner size="sm" color="primary.500" />
                <Text
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  color={cardColors.textSecondary}
                >
                  Loading chains...
                </Text>
              </HStack>
            ) : (
              <Select.Root
                collection={chainsCollection}
                value={selectedChain ? [selectedChain] : []}
                onValueChange={(details) =>
                  setSelectedChain(details.value[0] || "")
                }
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger
                    border="1px solid"
                    borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
                    borderRadius={materialDesign3Theme.borderRadius.sm}
                    color={isDark ? '#E0E0E0' : '#1A1A1A'}
                    bg={isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9'}
                    minH="48px"
                    px={4}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: isDark ? 'rgba(57,255,20,0.4)' : '#1FAE5C',
                    }}
                    _focus={{
                      borderColor: isDark ? '#39FF14' : '#1FAE5C',
                      boxShadow: isDark ? `0 0 0 2px rgba(57, 255, 20, 0.15)` : `0 0 0 2px rgba(31, 174, 92, 0.15)`,
                      outline: "none",
                    }}
                  >
                    <Select.ValueText placeholder="Select network" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content
                      bg={isDark ? '#0A0A0A' : '#FFFFFF'}
                      border="1px solid"
                      borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
                      borderRadius={materialDesign3Theme.borderRadius.sm}
                      boxShadow={materialDesign3Theme.elevation.level3}
                    >
                      {chainsList.map((chain) => (
                        <Select.Item
                          item={chain}
                          key={chain.value}
                          color={isDark ? '#E0E0E0' : '#1A1A1A'}
                          _hover={{ bg: isDark ? 'rgba(57,255,20,0.08)' : '#F0FDF4' }}
                          px={4}
                          py={3}
                        >
                          {chain.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            )}
          </VStack>

          {/* Token Selector */}
          <VStack align="stretch" gap={2}>
            <Text
              fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
              fontWeight="medium"
              color={cardColors.textSecondary}
            >
              Token
            </Text>
            {isTokensLoading ? (
              <HStack p={4} justify="center">
                <Spinner size="sm" color="primary.500" />
                <Text
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  color={cardColors.textSecondary}
                >
                  Loading tokens...
                </Text>
              </HStack>
            ) : (
              <Select.Root
                collection={tokensCollection}
                value={selectedToken ? [selectedToken] : []}
                onValueChange={(details) =>
                  setSelectedToken(details.value[0] || "")
                }
                disabled={!selectedChain}
              >
                <Select.HiddenSelect />
                <Select.Control>
                  <Select.Trigger
                    border="1px solid"
                    borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
                    borderRadius={materialDesign3Theme.borderRadius.sm}
                    color={isDark ? '#E0E0E0' : '#1A1A1A'}
                    bg={isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9'}
                    minH="48px"
                    px={4}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: isDark ? 'rgba(57,255,20,0.4)' : '#1FAE5C',
                    }}
                    _focus={{
                      borderColor: isDark ? '#39FF14' : '#1FAE5C',
                      boxShadow: isDark ? `0 0 0 2px rgba(57, 255, 20, 0.15)` : `0 0 0 2px rgba(31, 174, 92, 0.15)`,
                      outline: "none",
                    }}
                    _disabled={{
                      opacity: 0.5,
                      cursor: "not-allowed",
                    }}
                  >
                    <Select.ValueText placeholder="Select token" />
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content
                      bg={isDark ? '#0A0A0A' : '#FFFFFF'}
                      border="1px solid"
                      borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
                      borderRadius={materialDesign3Theme.borderRadius.sm}
                      boxShadow={materialDesign3Theme.elevation.level3}
                    >
                      {tokensList.map((token) => (
                        <Select.Item
                          item={token}
                          key={token.value}
                          color={isDark ? '#E0E0E0' : '#1A1A1A'}
                          _hover={{ bg: isDark ? 'rgba(57,255,20,0.08)' : '#F0FDF4' }}
                          px={4}
                          py={3}
                        >
                          {token.label}
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            )}
          </VStack>

          {/* Amount Input */}
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between">
              <Text
                fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                fontWeight="medium"
                color={cardColors.textSecondary}
              >
                Amount
              </Text>
              {selectedChainId && selectedToken && (
                <Button
                  variant="surface"
                  size="sm"
                  onClick={handleMaxAmount}
                  color={isDark ? '#39FF14' : '#1FAE5C'}
                  fontSize={materialDesign3Theme.typography.labelSmall.fontSize}
                  fontWeight="medium"
                  loading={isMaxQuoteLoading}
                  disabled={maxWithdrawAmount <= 0 && !isMaxQuoteLoading}
                  _hover={{ bg: isDark ? 'rgba(57,255,20,0.1)' : 'rgba(31,174,92,0.1)', color: isDark ? '#5FFF42' : '#15803D' }}
                >
                  MAX {maxWithdrawAmount > 0 ? `(${maxWithdrawAmount.toFixed(2)})` : ""}
                </Button>
              )}
            </HStack>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
              border="1px solid"
              borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              minH="48px"
              px={4}
              bg={isDark ? 'rgba(255,255,255,0.05)' : '#F9F9F9'}
              color={isDark ? '#E0E0E0' : '#1A1A1A'}
              fontFamily="'JetBrains Mono', monospace"
              _placeholder={{ color: isDark ? '#999999' : '#666666' }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                borderColor: isDark ? 'rgba(57,255,20,0.4)' : '#1FAE5C',
              }}
              _focus={{
                borderColor: isDark ? '#39FF14' : '#1FAE5C',
                boxShadow: isDark ? "0 0 0 2px rgba(57, 255, 20, 0.15)" : "0 0 0 2px rgba(31, 174, 92, 0.15)",
                outline: "none",
              }}
            />
            {/* {isAmountExceeded && (
              <Text
                color="error.600"
                fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
              >
                Amount cannot exceed your total portfolio value of $
                {maxWithdrawAmount.toLocaleString()}
              </Text>
            )} */}
          </VStack>

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            loading={currentStep !== "idle"}
            disabled={!amount || !selectedChain || !evmAddress || currentStep !== "idle"}
            bg={isDark ? '#39FF14' : '#1FAE5C'}
            color={isDark ? '#000000' : '#FFFFFF'}
            fontWeight="600"
            minH="48px"
            px={6}
            borderRadius="sm"
            fontSize="label-lg"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{ bg: isDark ? '#5FFF42' : '#15803D', boxShadow: isDark ? '0 0 20px rgba(57,255,20,0.5)' : 'none' }}
            _active={{
              bg: isDark ? '#2ECC11' : '#166534',
              boxShadow: "sm",
            }}
            _loading={{
              bg: isDark ? 'rgba(57,255,20,0.5)' : 'rgba(31,174,92,0.5)',
            }}
            _disabled={{
              bg: isDark ? 'rgba(57,255,20,0.3)' : 'rgba(31,174,92,0.3)',
              color: cardColors.textSecondary,
              cursor: "not-allowed",
              boxShadow: "none",
            }}
          >
            {currentStep === "withdrawing"
              ? "Withdrawing..."
              : "Withdraw"}
          </Button>

          {/* Polling Status Alert */}
          {pollingStatus && currentStep === "withdrawing" && (
            <Alert.Root
              status="info"
              bg={isDark ? 'rgba(57,255,20,0.06)' : 'rgba(31,174,92,0.06)'}
              border="1px solid"
              borderColor={isDark ? 'rgba(57,255,20,0.2)' : 'rgba(31,174,92,0.2)'}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
              overflow="hidden"
              width="100%"
            >
              <Alert.Description width="100%" overflow="hidden">
                <HStack gap={3} flexWrap="wrap">
                  <Spinner size="sm" color={isDark ? '#39FF14' : '#1FAE5C'} />
                  <Text
                    color={isDark ? '#E0E0E0' : '#1A1A1A'}
                    fontWeight="medium"
                    fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                    wordBreak="break-word"
                  >
                    Status: {pollingStatus}
                  </Text>
                </HStack>
              </Alert.Description>
            </Alert.Root>
          )}

          {/* Success Alert */}
          {successData ? (
            <Alert.Root
              status="success"
              bg={isDark ? 'rgba(57,255,20,0.08)' : 'rgba(31,174,92,0.08)'}
              border="1px solid"
              borderColor={isDark ? 'rgba(57,255,20,0.3)' : 'rgba(31,174,92,0.3)'}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
              overflow="hidden"
              width="100%"
            >
              <Alert.Description width="100%" overflow="hidden">
                <VStack align="stretch" gap={2} width="100%">
                  <Text
                    color={isDark ? '#39FF14' : '#1FAE5C'}
                    fontWeight="medium"
                    fontSize={
                      materialDesign3Theme.typography.labelLarge.fontSize
                    }
                  >
                    Request withdrawal successful!
                  </Text>
                  <HStack flexWrap="wrap" gap={1}>
                    <Text
                      fontSize={
                        materialDesign3Theme.typography.bodySmall.fontSize
                      }
                      color={isDark ? '#E0E0E0' : '#1A1A1A'}
                    >
                      Transaction:
                    </Text>
                    {getTransactionExplorerUrl(successData.hash) ? (
                      <Link
                        href={getTransactionExplorerUrl(successData.hash)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        color={isDark ? '#39FF14' : '#1FAE5C'}
                        fontSize={
                          materialDesign3Theme.typography.bodySmall.fontSize
                        }
                        fontFamily="'JetBrains Mono', monospace"
                        textDecoration="underline"
                        _hover={{ color: isDark ? '#5FFF42' : '#15803D' }}
                        wordBreak="break-all"
                      >
                        {successData.hash.slice(0, 8)}...
                        {successData.hash.slice(-8)}
                      </Link>
                    ) : (
                      <Text
                        color={isDark ? '#39FF14' : '#1FAE5C'}
                        fontSize={
                          materialDesign3Theme.typography.bodySmall.fontSize
                        }
                        fontFamily="'JetBrains Mono', monospace"
                        wordBreak="break-all"
                      >
                        {successData.hash.slice(0, 8)}...
                        {successData.hash.slice(-8)}
                      </Text>
                    )}
                  </HStack>
                  {/* Withdraw Status from Polling */}
                  {pollingStatus && (
                    <HStack flexWrap="wrap" gap={1}>
                      <Text
                        fontSize={
                          materialDesign3Theme.typography.bodySmall.fontSize
                        }
                        color={isDark ? '#E0E0E0' : '#1A1A1A'}
                      >
                        Withdrawal Status:
                      </Text>
                      <HStack gap={1}>
                        <Text
                          fontSize={
                            materialDesign3Theme.typography.bodySmall.fontSize
                          }
                          color={isDark ? '#39FF14' : '#1FAE5C'}
                          fontWeight="medium"
                          textTransform="capitalize"
                        >
                          {pollingStatus}
                        </Text>
                        {pollingStatus === "done" && (
                          <Text
                            fontSize={
                              materialDesign3Theme.typography.bodySmall.fontSize
                            }
                            color={isDark ? '#39FF14' : '#1FAE5C'}
                          >
                            ✓
                          </Text>
                        )}
                      </HStack>
                    </HStack>
                  )}
                  {/* Bridge Status */}
                  {isBridgeStatusLoading && (
                    <HStack gap={2}>
                      <Spinner size="xs" color={isDark ? '#39FF14' : '#1FAE5C'} />
                      <Text
                        fontSize={
                          materialDesign3Theme.typography.bodySmall.fontSize
                        }
                        color={isDark ? '#999999' : '#666666'}
                      >
                        Checking bridge status...
                      </Text>
                    </HStack>
                  )}
                  {bridgeStatus && (
                    <HStack flexWrap="wrap" gap={1}>
                      <Text
                        fontSize={
                          materialDesign3Theme.typography.bodySmall.fontSize
                        }
                        color={isDark ? '#E0E0E0' : '#1A1A1A'}
                      >
                        Bridge Status:
                      </Text>
                      <HStack gap={1}>
                        <Text
                          fontSize={
                            materialDesign3Theme.typography.bodySmall.fontSize
                          }
                          color={isDark ? '#39FF14' : '#1FAE5C'}
                          fontWeight="medium"
                          textTransform="capitalize"
                        >
                          {typeof bridgeStatus === "string"
                            ? bridgeStatus
                            : (bridgeStatus as any)?.status || "pending"}
                        </Text>
                        {(typeof bridgeStatus === "string" ? bridgeStatus : (bridgeStatus as any)?.status) === "done" && (
                          <Text
                            fontSize={
                              materialDesign3Theme.typography.bodySmall.fontSize
                            }
                            color={isDark ? '#39FF14' : '#1FAE5C'}
                          >
                            ✓
                          </Text>
                        )}
                      </HStack>
                    </HStack>
                  )}
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {/* Error Alert */}
          {(stepError || withdrawMutation.isError) && (
            <Alert.Root
              status="error"
              bg={isDark ? 'rgba(255,68,68,0.08)' : 'rgba(220,38,38,0.08)'}
              border="1px solid"
              borderColor={isDark ? 'rgba(255,68,68,0.3)' : 'rgba(220,38,38,0.3)'}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
              overflow="hidden"
              width="100%"
            >
              <Alert.Description width="100%" overflow="hidden">
                <Text
                  color={isDark ? '#FF4444' : '#DC2626'}
                  fontWeight="medium"
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                  wordBreak="break-word"
                >
                  {stepError ||
                    (withdrawMutation.error instanceof Error
                      ? withdrawMutation.error.message
                      : "Withdrawal failed")}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
