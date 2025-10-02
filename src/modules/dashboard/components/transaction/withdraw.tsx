import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useAuth } from "@/provider/auth-provider";
import { useThemeColors } from "@/provider/theme-provider";
import { useWithdrawMutation } from "@/hooks/use-moneyfi-queries";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";
import { useGetWalletAmountQuery } from "@/hooks/use-get-wallet-amount";
import { useGetUserStatisticsQuery } from "@/hooks/use-stats";
import { APTOS_ADDRESS } from "@/constants/address";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { KeylessPublicKey, KeylessSignature } from "@aptos-labs/ts-sdk";
import { isEd25519 } from "@/utils/web3";

const tokens = createListCollection({
  items: [
    { label: "USDC", value: "USDC" },
    { label: "USDT", value: "USDT" },
  ],
});

type CreateWithdrawRequestPayload = {
  encoded_signature: string;
  encoded_pubkey: string;
  full_message: string;
};

export const WithdrawComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { cardColors, buttonColors } = useThemeColors();
  const { data: hasWalletAccount, isLoading: isCheckingAccount } =
    useCheckWalletAccountQuery();
  const { data: userStats, isLoading: isLoadingStats } =
    useGetUserStatisticsQuery(user?.address);
  const { account: aptosAccount, signMessage: aptosSignMessage } = useWallet();
  // Form state
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);

  const tokenAddress =
    selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT;
  const amountInSmallestUnit = amount
    ? BigInt(Math.floor(parseFloat(amount) * 1_000_000))
    : BigInt(0);
  const withdrawMutation = useWithdrawMutation(
    tokenAddress,
    amountInSmallestUnit
  );

  // Get wallet amount for withdraw
  const { data: walletAmountData, isLoading: isLoadingWalletAmount } =
    useGetWalletAmountQuery(user?.address || null);
  console.log(JSON.stringify(walletAmountData?.data, null, 2));

  // Validation logic - match token_address with selected token
  const maxWithdrawAmount = walletAmountData?.data
    ? (() => {
        const targetAddress =
          selectedToken === "USDC"
            ? APTOS_ADDRESS.USDC.replace("0x", "")
            : APTOS_ADDRESS.USDT.replace("0x", "");
        console.log(targetAddress);
        const matchedToken = walletAmountData?.data.find(
          (token: { token_address: string }) =>
            token.token_address === targetAddress
        );

        return matchedToken
          ? Number(matchedToken.withdraw_amount) / 1_000_000
          : 0;
      })()
    : 0;
  console.log(maxWithdrawAmount);
  const currentAmount = amount ? parseFloat(amount) : 0;
  const isAmountExceeded = currentAmount > maxWithdrawAmount;
  const isAmountValid = currentAmount > 0 && !isAmountExceeded;

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
      target_chain_id: -1,
      token_address:
        selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT,
    };

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

    setSuccessData(null);

    try {
      await withdrawMutation.mutateAsync({
        address: user.address,
        payload,
      });
      setAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
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
            Withdraw Funds
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <Text
            color={cardColors.textSecondary}
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            Please connect your wallet to withdraw funds.
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
            MoneyFi Account Status
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
          Withdraw Funds
        </Text>
      </Card.Header>
      <Card.Body px={6} pb={6}>
        <VStack align="stretch" gap={6}>
          {walletAmountData && (
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
                        Available to Withdraw ({selectedToken})
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
            )}

          <VStack align="stretch" gap={2}>
            <Text
              fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
              fontWeight="medium"
              color={cardColors.textSecondary}
            >
              Token
            </Text>
            <Select.Root
              collection={tokens}
              value={[selectedToken]}
              onValueChange={(details) =>
                setSelectedToken(details.value[0] as "USDC" | "USDT")
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
                    boxShadow: `0 0 0 2px primary.200`,
                    outline: "none",
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
                    borderColor="neutral.200"
                    borderRadius={materialDesign3Theme.borderRadius.sm}
                    boxShadow={materialDesign3Theme.elevation.level3}
                  >
                    {tokens.items.map((token) => (
                      <Select.Item
                        item={token}
                        key={token.value}
                        color="neutral.100"
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
          </VStack>

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
                  border={
                    isAmountExceeded ? "1px solid" : "none"
                  }
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
                  ? `0 0 0 2px error.200`
                  : `0 0 0 2px primary.200`,
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

          <Button
            onClick={handleWithdraw}
            loading={
              withdrawMutation.isPending ||
              isCheckingAccount ||
              isLoadingStats ||
              isLoadingWalletAmount
            }
            disabled={
              !amount ||
              !isAmountValid ||
              withdrawMutation.isPending ||
              isCheckingAccount ||
              !hasWalletAccount ||
              isLoadingStats ||
              isLoadingWalletAmount
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
              : isLoadingWalletAmount
              ? "Loading Wallet Amount..."
              : withdrawMutation.isPending
              ? "Withdrawing..."
              : "Withdraw"}
          </Button>

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

          {withdrawMutation.isError && (
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
                  {withdrawMutation.error instanceof Error
                    ? withdrawMutation.error.message
                    : "Withdrawal failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
