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
import { useEVMWithdrawMutation, useGetSupportedChains, useGetSupportedTokens, evmQueryKeys, CHAIN_ID_MAP } from "@/hooks/evm/use-moneyfi-evm-queries";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";
import { useGetUserStatisticsQuery } from "@/hooks/use-stats";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { KeylessPublicKey, KeylessSignature } from "@aptos-labs/ts-sdk";
import { isEd25519 } from "@/utils/web3";

interface CreateWithdrawRequestPayload {
  encoded_signature: string;
  encoded_pubkey: string;
  full_message: string;
}

export const EVMWithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { address: evmAddress, isConnected: isEVMConnected } = useEVM();
  const { cardColors, buttonColors } = useThemeColors();
  const queryClient = useQueryClient();

  // Form state
  const [selectedChain, setSelectedChain] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"idle" | "signing" | "withdrawing">("idle");

  const { data: hasWalletAccount, isLoading: isCheckingAccount } =
    useCheckWalletAccountQuery();
  const { data: userStats, isLoading: isLoadingStats } =
    useGetUserStatisticsQuery(user?.address);

  // Fetch supported chains and tokens
  const { data: supportedChains, isLoading: isChainsLoading } =
    useGetSupportedChains();

  // Get chain ID from selected chain name
  const selectedChainId = selectedChain ? CHAIN_ID_MAP[selectedChain] : undefined;

  // Fetch tokens for the selected chain ID
  const { data: supportedTokens, isLoading: isTokensLoading } =
    useGetSupportedTokens(selectedChainId);

  const { account: aptosAccount, signMessage: aptosSignMessage } = useWallet();

  // Parse chains and tokens
  const chainsList = useMemo(() => {
    if (!supportedChains) return [];
    return Array.isArray(supportedChains)
      ? supportedChains.map((chain: any) => ({
          label: chain.name || String(chain.id),
          value: String(chain.id),
        }))
      : [];
  }, [supportedChains]);

  const tokensList = useMemo(() => {
    if (!supportedTokens) return [];
    return Array.isArray(supportedTokens)
      ? supportedTokens.map((token: any) => ({
          label: `${token.name} (${token.symbol || "?"})`,
          value: token.address || "",
        }))
      : [];
  }, [supportedTokens]);

  const chainsCollection = createListCollection({
    items: chainsList,
  });

  const tokensCollection = createListCollection({
    items: tokensList,
  });

  // Amount validation
  const maxWithdrawAmount = Number(userStats?.total_value || 0);
  const currentAmount = amount ? parseFloat(amount) : 0;
  const isAmountExceeded = currentAmount > maxWithdrawAmount;
  const isAmountValid = currentAmount > 0 && !isAmountExceeded;

  // Withdraw mutation
  const amountInSmallestUnit = amount
    ? BigInt(Math.floor(parseFloat(amount) * 1_000_000))
    : BigInt(0);

  const withdrawMutation = useEVMWithdrawMutation({
    chainId: selectedChainId || 0, // Use the chain ID calculated above
    tokenAddress: selectedToken,
    amount: amountInSmallestUnit,
  });

  const handleMaxAmount = () => {
    if (maxWithdrawAmount > 0) {
      setAmount(maxWithdrawAmount.toString());
    }
  };

  const handleWithdraw = async () => {
    if (!isAuthenticated || !user || !amount || !isAmountValid) {
      return;
    }

    const amountNum = parseFloat(amount.toString());
    const nonce = Math.random().toString(36).substring(2, 15);
    const message = {
      amount: amountNum,
      target_chain_id: selectedChain,
      token_address: selectedToken,
    };

    setCurrentStep("signing");
    setSuccessData(null);

    try {
      const messageSerialized = JSON.stringify(message);
      const withdrawSignature = await aptosSignMessage({
        message: messageSerialized,
        nonce,
      });

      let payload: CreateWithdrawRequestPayload = {
        encoded_signature: withdrawSignature.signature.toString(),
        // @ts-ignore
        encoded_pubkey: aptosAccount.publicKey.toString(),
        full_message: withdrawSignature.fullMessage.toString(),
      };

      // @ts-ignore
      const isWalletFromEd25519 = isEd25519(aptosAccount?.publicKey.toString());
      if (!isWalletFromEd25519) {
        const encodedKeylessPubkey = new KeylessPublicKey(
          (aptosAccount?.publicKey as any).publicKey.iss,
          (aptosAccount?.publicKey as any).publicKey.idCommitment
        );

        const encodedKeylessSignature = new KeylessSignature({
          ...(withdrawSignature.signature as any).signature,
        });

        payload = {
          encoded_signature: encodedKeylessSignature.toString(),
          encoded_pubkey: encodedKeylessPubkey.toString(),
          full_message: withdrawSignature.fullMessage.toString(),
        };
      } else {
        payload = {
          encoded_signature: withdrawSignature.signature.toString(),
          // @ts-ignore
          encoded_pubkey: aptosAccount.publicKey.toString(),
          full_message: withdrawSignature.fullMessage.toString(),
        };
      }

      setCurrentStep("withdrawing");

      const result = await withdrawMutation.mutateAsync({
        address: evmAddress || user.address, // Use EVM address if available, fallback to Aptos address
        payload,
      });

      // Refetch queries
      await queryClient.invalidateQueries({
        queryKey: evmQueryKeys.balance(selectedChain, evmAddress || user.address),
      });

      setAmount("");
      setSuccessData({ hash: result.hash || "pending" });
      setCurrentStep("idle");
    } catch (error) {
      console.error("Withdrawal failed:", error);
      setStepError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setCurrentStep("idle");
    }
  };

  if (!isAuthenticated || !isEVMConnected) {
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
            Withdraw Funds (EVM)
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <Text
            color={cardColors.textSecondary}
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            {!isAuthenticated
              ? "Please connect your Aptos wallet to withdraw funds."
              : "Please connect your EVM wallet (MetaMask) to withdraw funds."}
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!hasWalletAccount && !isCheckingAccount) {
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
            Account Status
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <VStack align="stretch" gap={4}>
            <Alert.Root
              status="warning"
              bg="warning.50"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              border="1px solid"
              borderColor="warning.200"
              p={4}
            >
              <Alert.Description>
                <Text
                  color="warning.800"
                  fontWeight="medium"
                  fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                >
                  Account not found
                </Text>
                <Text
                  color="warning.700"
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  mt={2}
                >
                  You need a MoneyFi account to withdraw funds. Please contact
                  support or create an account first.
                </Text>
              </Alert.Description>
            </Alert.Root>
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
          Withdraw Funds (EVM)
        </Text>
      </Card.Header>
      <Card.Body px={6} pb={6}>
        <VStack align="stretch" gap={6}>
          {/* Available Amount Display */}
          <Card.Root
            bg={cardColors.background}
            border="1px solid"
            borderColor={cardColors.border}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            boxShadow={materialDesign3Theme.elevation.level1}
          >
            <Card.Body p={4}>
              <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <Text
                    fontSize={
                      materialDesign3Theme.typography.labelLarge.fontSize
                    }
                    fontWeight="medium"
                    color={cardColors.textSecondary}
                  >
                    Available to Withdraw
                  </Text>
                </HStack>
                <Text
                  fontSize={
                    materialDesign3Theme.typography.headlineSmall.fontSize
                  }
                  fontWeight="bold"
                  color={cardColors.text}
                >
                  $
                  {maxWithdrawAmount > 0
                    ? maxWithdrawAmount.toFixed(6)
                    : "0.000000"}
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

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
              {maxWithdrawAmount > 0 && (
                <Button
                  variant="surface"
                  size="sm"
                  onClick={handleMaxAmount}
                  color="primary.600"
                  fontSize={materialDesign3Theme.typography.labelSmall.fontSize}
                  fontWeight="medium"
                  border={isAmountExceeded ? "1px solid" : "none"}
                  _hover={{ bg: "primary.900", color: "white" }}
                >
                  MAX
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
              borderColor={isAmountExceeded ? "error.500" : cardColors.border}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              minH="48px"
              px={4}
              bg={cardColors.background}
              color={cardColors.text}
              _placeholder={{ color: cardColors.textSecondary }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                borderColor: isAmountExceeded ? "error.500" : cardColors.border,
              }}
              _focus={{
                borderColor: isAmountExceeded ? "error.500" : "primary.500",
                boxShadow: isAmountExceeded
                  ? `0 0 0 2px rgba(229, 57, 53, 0.1)`
                  : `0 0 0 2px rgba(63, 81, 181, 0.1)`,
                outline: "none",
              }}
            />
            {isAmountExceeded && (
              <Text
                color="error.600"
                fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
              >
                Amount cannot exceed your total portfolio value of $
                {maxWithdrawAmount.toLocaleString()}
              </Text>
            )}
          </VStack>

          {/* Withdraw Button */}
          <Button
            onClick={handleWithdraw}
            loading={
              currentStep !== "idle" || isCheckingAccount || isLoadingStats
            }
            disabled={
              !amount ||
              !isAmountValid ||
              currentStep !== "idle" ||
              isCheckingAccount ||
              !hasWalletAccount ||
              isLoadingStats ||
              !selectedChain ||
              !selectedToken
            }
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
            _loading={{
              bg: buttonColors.error.disabled,
            }}
            _disabled={{
              bg: buttonColors.error.disabled,
              color: cardColors.textSecondary,
              cursor: "not-allowed",
              boxShadow: "none",
            }}
          >
            {isCheckingAccount
              ? "Checking Account..."
              : isLoadingStats
              ? "Loading Stats..."
              : currentStep === "signing"
              ? "Signing..."
              : currentStep === "withdrawing"
              ? "Withdrawing..."
              : "Withdraw"}
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
            >
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text
                    color="success.800"
                    fontWeight="medium"
                    fontSize={
                      materialDesign3Theme.typography.labelLarge.fontSize
                    }
                  >
                    Withdrawal successful!
                  </Text>
                  <HStack>
                    <Text
                      fontSize={
                        materialDesign3Theme.typography.bodySmall.fontSize
                      }
                      color="success.700"
                    >
                      Transaction:
                    </Text>
                    <Link
                      href={`https://explorer.aptoslabs.com/txn/${successData.hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary.600"
                      fontSize={
                        materialDesign3Theme.typography.bodySmall.fontSize
                      }
                      fontFamily="mono"
                      textDecoration="underline"
                      _hover={{ color: "primary.700" }}
                    >
                      {successData.hash.slice(0, 8)}...
                      {successData.hash.slice(-8)}
                    </Link>
                  </HStack>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {/* Error Alert */}
          {(stepError || withdrawMutation.isError) && (
            <Alert.Root
              status="error"
              bg="error.50"
              border="1px solid"
              borderColor="error.200"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
            >
              <Alert.Description>
                <Text
                  color="error.800"
                  fontWeight="medium"
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
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
