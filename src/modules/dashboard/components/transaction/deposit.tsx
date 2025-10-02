import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useThemeColors } from "@/provider/theme-provider";
import {
  useDepositMutation,
  moneyFiQueryKeys,
} from "@/hooks/use-moneyfi-queries";
import { statsQueryKeys } from "@/hooks/use-stats";
import { APTOS_ADDRESS } from "@/constants/address";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";
import {
  useGetOrCreateUserMutation,
  useGetTxInitializationAccountMutation,
} from "@/hooks/use-create";
import { useWallet as useAptosWallet } from "@aptos-labs/wallet-adapter-react";
import {
  AccountAddress,
  AccountAuthenticator,
  Deserializer,
  MultiAgentTransaction,
  SignedTransaction,
  TransactionAuthenticatorMultiAgent,
} from "@aptos-labs/ts-sdk";
import { APTOS_CONFIG, aptosClient } from "@/constants/aptos";
import { APTOS_ERROR_CODE } from "@/constants/error";
import { MoneyFi } from "@moneyfi/ts-sdk";

const tokens = createListCollection({
  items: [
    { label: "USDC", value: "USDC" },
    { label: "USDT", value: "USDT" },
  ],
});

export const DepositComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { cardColors, buttonColors } = useThemeColors();
  const queryClient = useQueryClient();
  const {
    data: hasWalletAccount,
    isLoading: isCheckingAccount,
    refetch: refetchAccountStatus,
  } = useCheckWalletAccountQuery();

  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<
    "idle" | "creating-user" | "initializing-account" | "depositing"
  >("idle");
  const [stepError, setStepError] = useState<string | null>(null);

  const tokenAddress =
    selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT;
  const userAddress = user?.address;

  // Hooks
  const createUserMutation = useGetOrCreateUserMutation();
  const initAccountMutation = useGetTxInitializationAccountMutation();
  const {
    account: aptosAccount,
    signTransaction: aptosSignTransaction,
    submitTransaction: aptosSubmitTransaction,
  } = useAptosWallet();
  const depositMutation = useDepositMutation({
    tokenAddress,
    sender: userAddress || "",
    amount: BigInt(amount ? Math.floor(Number(amount) * 1_000_000) : 0),
  });

  const checkOrCreateAptosAccount = async () => {
    if (!user?.address || !aptosAccount?.address) {
      throw new Error("User address or Aptos account not available");
    }
    
    try {
      const data = await new Promise<any>((resolve, reject) => {
        initAccountMutation.mutate(
          { address: user.address },
          {
            onSuccess: (data) => {
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });

      const signed_tx =
        typeof data === "object" && data?.signed_tx ? data.signed_tx : null;
      if (!signed_tx) {
        throw new Error("No signed transaction returned from initialization");
      }

      const txBytes = new Uint8Array(
        atob(signed_tx)
          .split("")
          .map((c) => c.charCodeAt(0))
      );
      const de = new Deserializer(txBytes);
      const tx = SignedTransaction.deserialize(de);
      const operatorAuth = (
        tx.authenticator as TransactionAuthenticatorMultiAgent
      ).sender.bcsToBytes();
      const operatorAddress = new AccountAddress(
        new Uint8Array(
          APTOS_CONFIG.OPERATOR_ADDRESS.match(/.{1,2}/g)?.map((byte) =>
            parseInt(byte, 16)
          ) || []
        )
      );
      const multiAgentTx = new MultiAgentTransaction(tx.raw_txn, [
        operatorAddress,
      ]);

      const feepayerAuthenticator = await aptosSignTransaction({
        transactionOrPayload: multiAgentTx,
      });

      const submitTx = await aptosSubmitTransaction({
        transaction: multiAgentTx,
        senderAuthenticator: feepayerAuthenticator.authenticator,
        additionalSignersAuthenticators: [
          AccountAuthenticator.deserialize(new Deserializer(operatorAuth)),
        ],
      });
      
    } catch (error) {
      console.error("Account initialization failed:", error);
      throw error;
    }
  };

  const handleDeposit = async () => {
    if (!amount || !user?.address) {
      return;
    }

    setSuccessData(null);
    setStepError(null);

    try {
      // Always fetch user information first
      const moneyFiAptos = new MoneyFi(import.meta.env.VITE_INTEGRATION_CODE || "");
      let userInfo;
      let userExists = false;
      
      try {
        userInfo = await moneyFiAptos.getUserInformation(user.address);
        console.log("User information fetched:", userInfo);
        userExists = true;
      } catch (error) {
        console.log("User information not found, will create user");
      }
      // If user exists, skip initialization and go directly to deposit
      if (userExists) {
        console.log("User exists, proceeding directly to deposit");
        setCurrentStep("depositing");
        await new Promise<any>((resolve, reject) => {
          depositMutation.mutate(
            { amount, tokenAddress },
            {
              onSuccess: async (data) => {
                queryClient.invalidateQueries({
                  queryKey: moneyFiQueryKeys.balance(user.address),
                });
                queryClient.invalidateQueries({
                  queryKey: ["transactions", user.address],
                });
                queryClient.invalidateQueries({
                  queryKey: statsQueryKeys.user(user.address),
                });

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
      } else {
        // User doesn't exist - follow the full initialization flow
        setCurrentStep("creating-user");
        await new Promise<any>((resolve, reject) => {
          createUserMutation.mutate(
            {
              address: user.address,
              refBy: undefined,
            },
            {
              onSuccess: async (data) => {
                // Invalidate user-related queries after successful user creation
                await queryClient.invalidateQueries({
                  queryKey: ["user", user.address],
                });
                await queryClient.invalidateQueries({
                  queryKey: ["userProfile"],
                });
                resolve(data);
              },
              onError: (error) => {
                reject(error);
              },
            }
          );
        });

        // Initialize wallet account for new users
        if (!hasWalletAccount) {
          setCurrentStep("initializing-account");
          await checkOrCreateAptosAccount();

          // Invalidate wallet account queries after successful account initialization
          await queryClient.invalidateQueries({
            queryKey: ["checkWalletAccount"],
          });
          await queryClient.invalidateQueries({
            queryKey: ["walletAccount", user.address],
          });

          await refetchAccountStatus();
        }

        // Finally, proceed to deposit
        setCurrentStep("depositing");
        await new Promise<any>((resolve, reject) => {
          depositMutation.mutate(
            { amount, tokenAddress },
            {
              onSuccess: async (data) => {
                queryClient.invalidateQueries({
                  queryKey: moneyFiQueryKeys.balance(user.address),
                });
                queryClient.invalidateQueries({
                  queryKey: ["transactions", user.address],
                });
                queryClient.invalidateQueries({
                  queryKey: statsQueryKeys.user(user.address),
                });

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
      }
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
            Deposit Funds
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <Text
            color={cardColors.textSecondary}
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            Please connect your wallet to deposit funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }
  console.log("hasWalletAccount", hasWalletAccount, isCheckingAccount);
  // if (!hasWalletAccount && !isCheckingAccount) {
  //   return (
  //     <Card.Root
  //       bg={cardColors.background}
  //       borderRadius={materialDesign3Theme.borderRadius.md}
  //       boxShadow={materialDesign3Theme.elevation.level1}
  //       transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  //       _hover={{
  //         boxShadow: materialDesign3Theme.elevation.level2,
  //       }}
  //       border="1px solid"
  //       borderColor={cardColors.border}
  //     >
  //       <Card.Header p={6}>
  //         <Text
  //           fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
  //           lineHeight={materialDesign3Theme.typography.titleLarge.lineHeight}
  //           fontWeight="medium"
  //           color={cardColors.text}
  //         >
  //           MoneyFi Account Status
  //         </Text>
  //       </Card.Header>
  //       <Card.Body px={6} pb={6}>
  //         <VStack align="stretch" gap={4}>
  //           <Alert.Root
  //             status="warning"
  //             bg="warning.50"
  //             borderRadius={materialDesign3Theme.borderRadius.sm}
  //             border="1px solid"
  //             borderColor="warning.200"
  //             p={4}
  //           >
  //             <Alert.Description>
  //               <Text
  //                 color="warning.800"
  //                 fontWeight="medium"
  //                 fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
  //               >
  //                 Account not found
  //               </Text>
  //               <Text
  //                 color="warning.700"
  //                 fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
  //                 mt={2}
  //               >
  //                 You need a MoneyFi account to deposit funds. Please contact
  //                 support or create an account first.
  //               </Text>
  //             </Alert.Description>
  //           </Alert.Root>
  //         </VStack>
  //       </Card.Body>
  //     </Card.Root>
  //   );
  // }

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
          Deposit Funds
        </Text>
      </Card.Header>
      <Card.Body px={6} pb={6}>
        <VStack align="stretch" gap={6}>
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
                    borderColor={cardColors.border}
                    borderRadius={materialDesign3Theme.borderRadius.sm}
                    boxShadow={materialDesign3Theme.elevation.level3}
                  >
                    {tokens.items.map((token) => (
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
          </VStack>
          <VStack align="stretch" gap={2}>
            <Text
              fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
              fontWeight="medium"
              color={cardColors.textSecondary}
            >
              Amount
            </Text>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
              border="1px solid"
              borderColor={cardColors.border}
              borderRadius={materialDesign3Theme.borderRadius.sm}
              minH="48px"
              px={4}
              bg={cardColors.background}
              color={cardColors.text}
              _placeholder={{ color: cardColors.textSecondary }}
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                borderColor: cardColors.border,
              }}
              _focus={{
                borderColor: "primary.500",
                boxShadow: `0 0 0 2px primary.200`,
                outline: "none",
              }}
            />
          </VStack>

          <Button
            onClick={handleDeposit}
            loading={currentStep !== "idle" || isCheckingAccount}
            disabled={!amount || currentStep !== "idle" || isCheckingAccount}
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
              {isCheckingAccount
                ? "Checking Account..."
                : currentStep === "creating-user"
                ? "Creating User..."
                : currentStep === "initializing-account"
                ? "Initializing Account..."
                : currentStep === "depositing"
                ? "Depositing..."
                : "Deposit"}
            </span>
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
                    Deposit successful!
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

          {(stepError ||
            depositMutation.isError ||
            createUserMutation.isError ||
            initAccountMutation.isError) && (
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
                    (depositMutation.error instanceof Error
                      ? depositMutation.error.message
                      : depositMutation.isError
                      ? "Deposit failed"
                      : createUserMutation.error instanceof Error
                      ? createUserMutation.error.message
                      : createUserMutation.isError
                      ? "User creation failed"
                      : initAccountMutation.error instanceof Error
                      ? initAccountMutation.error.message
                      : "Account initialization failed")}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
