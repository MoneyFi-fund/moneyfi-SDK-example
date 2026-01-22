import React, { useState, useMemo } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Input,
  Alert,
  Link,
  HStack,
  Portal,
  Select,
  createListCollection,
  Spinner,
} from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useEVM } from "@/provider/evm-provider";
import { useThemeColors } from "@/provider/theme-provider";
import {
  useEVMDepositMutation,
  useGetSupportedChains,
  useGetSupportedTokens,
  evmQueryKeys,
} from "@/hooks/evm/use-moneyfi-evm-queries";
import { getExplorerUrl } from "@/hooks/common/get-explorer-url";
import { CHAIN_ID_MAP } from "@/config/chains";
import { useGetBridgeStatusQuery } from "@/hooks/common/use-bridge-status";
import { maxQuoteQueryKeys } from "@/hooks/use-get-max-quote";
import { statsQueryKeys } from "@/hooks/common";
import { useGetUserAssetBalance } from "@/hooks/common";

export const EVMDepositComponent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { address: evmAddress, isConnected: isEVMConnected } = useEVM();
  const { cardColors, buttonColors } = useThemeColors();
  const queryClient = useQueryClient();

  // Local state
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<"idle" | "depositing">("idle");
  const [stepError, setStepError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);

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

  // Fetch supported tokens
  const { data: supportedTokens, isLoading: isTokensLoading } =
    useGetSupportedTokens();

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

    // Filter tokens by selected chain name (selectedChain is the chain name like "Base", "Arbitrum", etc.)
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

  // Create deposit mutation with selected chain/token
  const depositMutation = useEVMDepositMutation({
    chainId: selectedChainId || 0, // Use the chain ID calculated above
    tokenAddress: selectedToken,
    sender: evmAddress || "", // Use EVM wallet address instead of Aptos address
    amount: (amount ? Math.floor(Number(amount) * 10**6) : 0),
  });

  // Poll bridge status for the transaction
  const { data: bridgeStatus, isLoading: isBridgeStatusLoading } = useGetBridgeStatusQuery(
    successData?.hash,
    !!successData?.hash
  );

  // Fetch user asset balance from SDK
  const {
    data: assetBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useGetUserAssetBalance({
    address: evmAddress || undefined,
    chainId: selectedChainId,
    tokenAddress: selectedToken || undefined,
  });

  // Derive display values from SDK response (SDK returns balance in display units as float)
  const balanceValue = Number(assetBalance?.balance) || 0;
  const displayBalance = balanceValue.toFixed(2);

  // Validate balance
  const { isInsufficientBalance, maxAmount } = useMemo(() => {
    const numAmount = Number(amount) || 0;
    return { isInsufficientBalance: numAmount > balanceValue, maxAmount: balanceValue };
  }, [amount, balanceValue]);

  // MAX button handler
  const handleMaxAmount = () => {
    if (!assetBalance?.balance) return;
    setAmount(balanceValue.toString());
  };

  const handleDeposit = async () => {
    if (!amount || !selectedChain || !evmAddress) {
      setStepError("Please connect your EVM wallet first");
      return;
    }

    setSuccessData(null);
    setStepError(null);

    try {
      setCurrentStep("depositing");

      await new Promise<any>((resolve, reject) => {
        depositMutation.mutate(
          { amount, tokenAddress: selectedToken },
          {
            onSuccess: async (data) => {
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

              // Refetch token balance
              refetchBalance();

              setAmount("");
              setSuccessData({ hash: data.hash });
              setCurrentStep("idle");
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error("Deposit process failed:", error);
      setStepError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setCurrentStep("idle");
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          boxShadow: materialDesign3Theme.elevation.level2,
        }}
        border="1px solid"
        borderColor={cardColors.border}
      >
        <Card.Header p={6}>
          <Text
            fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
            lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
            fontWeight="medium"
            color={cardColors.text}
          >
            Deposit Funds (EVM)
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <VStack align="stretch" gap={4}>
            <Text
              color={cardColors.textSecondary}
              fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
              lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
            >
              Please connect your wallet (Aptos or EVM) to deposit funds.
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!isEVMConnected) {
    return (
      <Card.Root
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          boxShadow: materialDesign3Theme.elevation.level2,
        }}
        border="1px solid"
        borderColor={cardColors.border}
      >
        <Card.Header p={6}>
          <Text
            fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
            lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
            fontWeight="medium"
            color={cardColors.text}
          >
            Deposit Funds (EVM)
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <VStack align="stretch" gap={4}>
            <Text
              color={cardColors.textSecondary}
              fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
              lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
            >
              Please connect your EVM wallet (MetaMask) in the header to deposit funds.
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      bg={cardColors.background}
      borderRadius={materialDesign3Theme.borderRadius.md}
      boxShadow={materialDesign3Theme.elevation.level1}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        boxShadow: materialDesign3Theme.elevation.level2,
      }}
      border="1px solid"
      borderColor={cardColors.border}
    >
      <Card.Header p={6}>
        <Text
          fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
          lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
          fontWeight="medium"
          color={cardColors.text}
        >
          Deposit Funds (EVM)
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
                    borderColor={cardColors.border}
                    borderRadius={materialDesign3Theme.borderRadius.sm}
                    color={cardColors.text}
                    bg={cardColors.background}
                    minH="48px"
                    px={4}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: cardColors.border,
                      boxShadow: materialDesign3Theme.elevation.level1,
                    }}
                    _focus={{
                      borderColor: "primary.500",
                      boxShadow: `0 0 0 2px rgba(63, 81, 181, 0.1)`,
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
                      bg={cardColors.background}
                      border="1px solid"
                      borderColor={cardColors.border}
                      borderRadius={materialDesign3Theme.borderRadius.sm}
                      boxShadow={materialDesign3Theme.elevation.level3}
                    >
                      {chainsList.map((chain) => (
                        <Select.Item
                          item={chain}
                          key={chain.value}
                          color={cardColors.text}
                          _hover={{ bg: "neutral.100" }}
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
                    borderColor={cardColors.border}
                    borderRadius={materialDesign3Theme.borderRadius.sm}
                    color={cardColors.text}
                    bg={cardColors.background}
                    minH="48px"
                    px={4}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: cardColors.border,
                      boxShadow: materialDesign3Theme.elevation.level1,
                    }}
                    _focus={{
                      borderColor: "primary.500",
                      boxShadow: `0 0 0 2px rgba(63, 81, 181, 0.1)`,
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
                      bg={cardColors.background}
                      border="1px solid"
                      borderColor={cardColors.border}
                      borderRadius={materialDesign3Theme.borderRadius.sm}
                      boxShadow={materialDesign3Theme.elevation.level3}
                    >
                      {tokensList.map((token) => (
                        <Select.Item
                          item={token}
                          key={token.value}
                          color={cardColors.text}
                          _hover={{ bg: "neutral.100" }}
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

          {/* Amount Input with Balance Display */}
          <VStack align="stretch" gap={2}>
            <HStack justify="space-between" align="center">
              <Text
                fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                fontWeight="medium"
                color={cardColors.textSecondary}
              >
                Amount
              </Text>
              <HStack gap={2}>
                <Text
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  color={cardColors.textSecondary}
                >
                  Balance: {isBalanceLoading ? "..." : displayBalance}
                </Text>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={handleMaxAmount}
                  disabled={!assetBalance?.balance || isBalanceLoading}
                  borderRadius={materialDesign3Theme.borderRadius.sm}
                  fontSize="xs"
                  px={2}
                  minH="24px"
                  borderColor={cardColors.border}
                  color={cardColors.text}
                  _hover={{
                    bg: cardColors.background,
                    borderColor: "primary.500",
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: "not-allowed",
                  }}
                >
                  MAX
                </Button>
              </HStack>
            </HStack>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
              border="1px solid"
              borderColor={isInsufficientBalance ? "error.500" : cardColors.border}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              minH="48px"
              px={4}
              bg={cardColors.background}
              color={cardColors.text}
              _placeholder={{ color: cardColors.textSecondary }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                borderColor: isInsufficientBalance ? "error.500" : cardColors.border,
              }}
              _focus={{
                borderColor: isInsufficientBalance ? "error.500" : "primary.500",
                boxShadow: isInsufficientBalance
                  ? "0 0 0 2px rgba(239, 68, 68, 0.1)"
                  : "0 0 0 2px rgba(63, 81, 181, 0.1)",
                outline: "none",
              }}
            />
            {/* Insufficient Balance Warning */}
            {isInsufficientBalance && (
              <Text
                fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                color="error.600"
              >
                Insufficient balance. Max: {maxAmount.toFixed(2)}
              </Text>
            )}
          </VStack>
          
          {/* Deposit Button */}
          <Button
            onClick={handleDeposit}
            loading={currentStep !== "idle"}
            disabled={
              !amount ||
              !selectedChain ||
              !evmAddress ||
              currentStep !== "idle" ||
              isInsufficientBalance
            }
            bg={buttonColors.primary.background}
            color={buttonColors.primary.text}
            minH="48px"
            px={6}
            borderRadius="sm"
            fontWeight="medium"
            fontSize="label-lg"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            boxShadow="sm"
            _hover={{
              bg: buttonColors.primary.hover,
              boxShadow: "md",
            }}
            _active={{
              bg: buttonColors.primary.active,
              boxShadow: "sm",
            }}
            _loading={{
              bg: buttonColors.primary.disabled,
            }}
            _disabled={{
              bg: buttonColors.primary.disabled,
              color: cardColors.textSecondary,
              cursor: "not-allowed",
              boxShadow: "none",
            }}
          >
            <span>
              {currentStep === "depositing"
                ? "Depositing..."
                : isInsufficientBalance
                  ? "Insufficient Balance"
                  : "Deposit"}
            </span>
          </Button>

          {/* Success Alert */}
          {successData ? (
            <Alert.Root
              status="success"
              bg="success.50"
              border="1px solid"
              borderColor="success.200"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
              overflow="hidden"
              width="100%"
            >
              <Alert.Description width="100%" overflow="hidden">
                <VStack align="stretch" gap={2} width="100%">
                  <Text
                    color="success.800"
                    fontWeight="medium"
                    fontSize={
                      materialDesign3Theme.typography.labelLarge.fontSize
                    }
                  >
                    Deposit successful!
                  </Text>
                  <HStack flexWrap="wrap" gap={1}>
                    <Text
                      fontSize={
                        materialDesign3Theme.typography.bodySmall.fontSize
                      }
                      color="success.700"
                    >
                      Transaction:
                    </Text>
                    <Link
                      href={getTransactionExplorerUrl(successData.hash) || `https://explorer.aptoslabs.com/txn/${successData.hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary.600"
                      fontSize={
                        materialDesign3Theme.typography.bodySmall.fontSize
                      }
                      fontFamily="mono"
                      textDecoration="underline"
                      _hover={{ color: "primary.700" }}
                      wordBreak="break-all"
                    >
                      {successData.hash.slice(0, 8)}...
                      {successData.hash.slice(-8)}
                    </Link>
                  </HStack>
                  {/* Bridge Status */}
                  {isBridgeStatusLoading && (
                    <HStack gap={2}>
                      <Spinner size="xs" color="primary.500" />
                      <Text
                        fontSize={
                          materialDesign3Theme.typography.bodySmall.fontSize
                        }
                        color="success.700"
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
                        color="success.700"
                      >
                        Bridge Status:
                      </Text>
                      <HStack gap={1}>
                        <Text
                          fontSize={
                            materialDesign3Theme.typography.bodySmall.fontSize
                          }
                          color={
                            (typeof bridgeStatus === "string" ? bridgeStatus : (bridgeStatus as any)?.status) === "done"
                              ? "success.900"
                              : "success.800"
                          }
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
                            color="success.900"
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
          {(stepError || depositMutation.isError) && (
            <Alert.Root
              status="error"
              bg="error.50"
              border="1px solid"
              borderColor="error.200"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
              overflow="hidden"
              width="100%"
            >
              <Alert.Description width="100%" overflow="hidden">
                <Text
                  color="error.800"
                  fontWeight="medium"
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                  wordBreak="break-word"
                >
                  {stepError ||
                    (depositMutation.error instanceof Error
                      ? depositMutation.error.message
                      : "Deposit failed")}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
