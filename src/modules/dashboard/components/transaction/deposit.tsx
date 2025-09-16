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
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/provider/auth-provider";
import { useDepositMutation, moneyFiQueryKeys } from "@/hooks/use-moneyfi-queries";
import { statsQueryKeys } from "@/hooks/use-stats";
import { APTOS_ADDRESS } from "@/constants/address";
import { useCheckWalletAccountQuery } from "@/api/use-check-wallet-account";
import { useGetOrCreateUserMutation, useGetTxInitializationAccountMutation } from "@/hooks/use-create";
import {
  useWallet as useAptosWallet,
} from "@aptos-labs/wallet-adapter-react";
import {
  AccountAddress,
  AccountAuthenticator,
  Deserializer,
  MultiAgentTransaction,
  SignedTransaction,
  TransactionAuthenticatorMultiAgent,
} from "@aptos-labs/ts-sdk";
import {
  APTOS_CONFIG,
  aptosClient,
} from "@/constants/aptos";
import { APTOS_ERROR_CODE } from "@/constants/error";

const tokens = createListCollection({
  items: [
    { label: "USDC", value: "USDC" },
    { label: "USDT", value: "USDT" },
  ],
});

export const DepositComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: hasWalletAccount, isLoading: isCheckingAccount, refetch: refetchAccountStatus } = useCheckWalletAccountQuery();
  console.log(
    "%c🔑 hasWalletAccount: %c" + hasWalletAccount,
    "background: #2d3748; color: #fff; padding: 2px 6px; border-radius: 4px; font-weight: bold;",
    "background: #3182ce; color: #fff; padding: 2px 6px; border-radius: 4px;"
  );
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<'idle' | 'creating-user' | 'initializing-account' | 'depositing'>('idle');
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
      const data = await new Promise<any>(
        (resolve, reject) => {
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
        }
      );
      console.log(data);

      const signed_tx = typeof data === 'object' && data?.signed_tx ? data.signed_tx : null;
      if (!signed_tx) {
        throw new Error("No signed transaction returned from initialization");
      }
      console.log(signed_tx);

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

      const response = await aptosClient.waitForTransaction({
        transactionHash: submitTx.hash,
      });

      if (!response.success) {
        throw new Error(APTOS_ERROR_CODE.CREATE_ACCOUNT_FAILED);
      }
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
      setCurrentStep('creating-user');
      await new Promise<any>((resolve, reject) => {
        createUserMutation.mutate(
          {
            address: user.address,
            refBy: undefined
          },
          {
            onSuccess: async (data) => {
              // Invalidate user-related queries after successful user creation
              await queryClient.invalidateQueries({
                queryKey: ['user', user.address],
              });
              await queryClient.invalidateQueries({
                queryKey: ['userProfile'],
              });
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
      console.log("User creation checked/processed.");
      if (!hasWalletAccount) {
        setCurrentStep('initializing-account');
        console.log("No wallet account found, initializing...");
        await checkOrCreateAptosAccount();

        // Invalidate wallet account queries after successful account initialization
        await queryClient.invalidateQueries({
          queryKey: ['checkWalletAccount'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['walletAccount', user.address],
        });

        await refetchAccountStatus();
      }
      console.log("Wallet account exists, proceeding to deposit...");

      setCurrentStep('depositing');
      await new Promise<any>((resolve, reject) => {
        console.log("Starting deposit mutation...");
        depositMutation.mutate(
          { amount, tokenAddress },
          {
            onSuccess: async (data) => {
              queryClient.invalidateQueries({
                queryKey: moneyFiQueryKeys.balance(user.address),
              });
              queryClient.invalidateQueries({
                queryKey: ['transactions', user.address],
              });
              queryClient.invalidateQueries({
                queryKey: statsQueryKeys.user(user.address),
              });

              setAmount("");
              setSuccessData({ hash: data.hash });
              setCurrentStep('idle');
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error('Deposit process failed:', error);
      setStepError(error instanceof Error ? error.message : 'An unknown error occurred');
      setCurrentStep('idle');
    }
  };

  if (!isAuthenticated) {
    return (
      <Card.Root
        bg="gray.900"
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
          <Text fontSize="lg" fontWeight="semibold" color="white">
            Deposit Funds
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to deposit funds.
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!hasWalletAccount && !isCheckingAccount) {
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
          <Text fontSize="lg" fontWeight="semibold" color="white">
            MoneyFi Account Status
          </Text>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" gap={3}>
            <Alert.Root
              status="warning"
              bg="yellow.800"
              border="2px solid yellow.300"
              borderRadius="0"
              boxShadow="3px 3px 0px yellow.300"
            >
              <Alert.Description>
                <Text color="yellow.100" fontWeight="bold">
                  Account not found
                </Text>
                <Text color="yellow.200" fontSize="sm" mt={1}>
                  You need a MoneyFi account to deposit funds. Please contact support or create an account first.
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
        <Text fontSize="lg" fontWeight="semibold" color="white">
          Deposit Funds
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="white">
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
                  border="3px solid white"
                  borderRadius="0"
                  color="white"
                  bg="black"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translate(2px, 2px)",
                    boxShadow: "3px 3px 0px white",
                  }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "5px 5px 0px blue.400",
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
                  <Select.Content bg="black" border="2px solid white">
                    {tokens.items.map((token) => (
                      <Select.Item item={token} key={token.value} color="white">
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
            <Text fontSize="sm" fontWeight="medium" color="white">
              Amount
            </Text>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.000001"
              min="0"
              border={"2px solid white"}
            />
          </VStack>

          <Button
            onClick={handleDeposit}
            loading={currentStep !== 'idle' || isCheckingAccount}
            disabled={!amount || currentStep !== 'idle' || isCheckingAccount}
            bg="blue.500"
            color="white"
            size="md"
            border="3px solid white"
            borderRadius="0"
            boxShadow="5px 5px 0px white"
            transition="all 0.3s ease"
            fontWeight="bold"
            _hover={{
              bg: "blue.400",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px white",
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px white",
            }}
            _loading={{
              bg: "blue.400",
              transform: "none",
              boxShadow: "5px 5px 0px white",
            }}
            _disabled={{
              bg: "gray.600",
              color: "gray.300",
              cursor: "not-allowed",
              transform: "none",
              boxShadow: "5px 5px 0px gray.400",
            }}
          >
            {isCheckingAccount
              ? "Checking Account..."
              : currentStep === 'creating-user'
              ? "Creating User..."
              : currentStep === 'initializing-account'
              ? "Initializing Account..."
              : currentStep === 'depositing'
              ? "Depositing..."
              : "Deposit"
            }
          </Button>

          {successData ? (
            <Alert.Root
              status="success"
              bg="green.900"
              border="2px solid green.400"
              borderRadius="0"
              boxShadow="4px 4px 0px green.400"
            >
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text color="green.100" fontWeight="bold">
                    Deposit successful!
                  </Text>
                  <HStack>
                    <Text fontSize="sm" color="green.200">
                      Transaction:
                    </Text>
                    <Link
                      href={`https://explorer.aptoslabs.com/txn/${successData.hash}?network=mainnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="green.300"
                      fontSize="sm"
                      fontFamily="mono"
                      textDecoration="underline"
                      _hover={{ color: "green.100" }}
                    >
                      {successData.hash.slice(0, 8)}...
                      {successData.hash.slice(-8)}
                    </Link>
                  </HStack>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {(stepError || depositMutation.isError || createUserMutation.isError || initAccountMutation.isError) && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
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
