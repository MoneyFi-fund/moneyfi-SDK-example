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
import { useAuth } from "@/provider/auth-provider";
import { useWithdrawMutation } from "@/hooks/use-moneyfi-queries";
import { useCheckWalletAccountQuery } from "@/api/use-check-wallet-account";
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
  const { data: hasWalletAccount, isLoading: isCheckingAccount } =
    useCheckWalletAccountQuery();
  const { data: userStats, isLoading: isLoadingStats } =
    useGetUserStatisticsQuery(user?.address);
  const {
    account: aptosAccount,
    signMessage: aptosSignMessage,
    signAndSubmitTransaction: aptosSignAndSubmitTransaction,
  } = useWallet();
  // Form state
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);

  const tokenAddress = selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT;
  const amountInSmallestUnit = amount ? BigInt(Math.floor(parseFloat(amount) * 1_000_000)) : BigInt(0);
  const withdrawMutation = useWithdrawMutation(tokenAddress, amountInSmallestUnit);

  const handleWithdraw = async () => {
    if (!isAuthenticated || !user || !amount) {
      return;
    }
    const amountNum = parseFloat(amount.toString());
    const nonce = Math.random().toString(36).substring(2, 15);
    const message = {
      amount: amountNum,
      target_chain_id: -1,
      token_address: selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT
    };
    console.log(message);

    const messageSerialized = JSON.stringify(message);
    const withdrawSignature = await aptosSignMessage({
      message: messageSerialized,
      nonce,
    });
    let payload: CreateWithdrawRequestPayload = {
      encoded_signature: withdrawSignature.signature.toString(),
      // @ts-ignore
      encoded_pubkey: aptosAccount.publicKey.toString(),
      full_message: withdrawSignature.fullMessage.toString()
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
        full_message: withdrawSignature.fullMessage.toString()
      };
    } else {
      payload = {
        encoded_signature: withdrawSignature.signature.toString(),
        // @ts-ignore
        encoded_pubkey: aptosAccount.publicKey.toString(),
        full_message: withdrawSignature.fullMessage.toString()
      };
    }
    console.log(payload.encoded_signature, payload.encoded_pubkey, withdrawSignature.fullMessage);

    setSuccessData(null);

    try {
      const result = await withdrawMutation.mutateAsync({
        address: user.address,
        payload
      });
      console.log(result);
      setAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
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
            Withdraw Funds
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to withdraw funds.
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
          Withdraw Funds
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          {userStats && (
            <Card.Root
              bg="gray.800"
              border="2px solid gray.400"
              borderRadius="0"
              boxShadow="3px 3px 0px gray.400"
            >
              <Card.Body>
                <VStack align="stretch" gap={2}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.300">
                    Total Portfolio Value
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="white">
                    $
                    {userStats.total_value
                      ? Number(userStats.total_value).toLocaleString()
                      : "0"}
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          )}

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
                    borderColor: "red.400",
                    boxShadow: "5px 5px 0px red.400",
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
              border="2px solid white"
              borderRadius="0"
              color="white"
              bg="black"
              _placeholder={{ color: "gray.400" }}
              _focus={{
                borderColor: "red.400",
                boxShadow: "5px 5px 0px red.400",
              }}
            />
          </VStack>

          <Button
            onClick={handleWithdraw}
            loading={
              withdrawMutation.isPending || isCheckingAccount || isLoadingStats
            }
            disabled={
              !amount ||
              withdrawMutation.isPending ||
              isCheckingAccount ||
              !hasWalletAccount ||
              isLoadingStats
            }
            bg="red.600"
            color="white"
            size="md"
            border="3px solid white"
            borderRadius="0"
            boxShadow="5px 5px 0px white"
            transition="all 0.3s ease"
            fontWeight="bold"
            _hover={{
              bg: "red.500",
              color: "white",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px white",
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px white",
            }}
            _loading={{
              bg: "red.500",
              color: "white",
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
              : isLoadingStats
              ? "Loading Stats..."
              : withdrawMutation.isPending
              ? "Withdrawing..."
              : "Withdraw"}
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
                    Withdrawal successful!
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

          {withdrawMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
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
