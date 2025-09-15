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
import { useAuth } from "@/provider/auth-provider";
import { useDepositMutation } from "@/hooks/use-moneyfi-queries";
import { APTOS_ADDRESS } from "@/constants/address";

const tokens = createListCollection({
  items: [
    { label: "USDC", value: "USDC" },
    { label: "USDT", value: "USDT" },
  ],
});

export const DepositComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDC" | "USDT">("USDC");
  const [successData, setSuccessData] = useState<{ hash: string } | null>(null);
  const tokenAddress =
    selectedToken === "USDC" ? APTOS_ADDRESS.USDC : APTOS_ADDRESS.USDT;
  const userAddress = user?.address;
  const depositMutation = useDepositMutation({
    tokenAddress,
    sender: userAddress || "",
    amount: BigInt(amount ? Math.floor(Number(amount) * 1_000_000) : 0),
  });

  const handleDeposit = async () => {
    if (amount) {
      setSuccessData(null);

      depositMutation.mutate(
        { amount, tokenAddress },
        {
          onSuccess: (data) => {
            setAmount("");
            setSuccessData({ hash: data.hash });
          },
        }
      );
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
            loading={depositMutation.isPending}
            disabled={!amount || depositMutation.isPending}
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
            {depositMutation.isPending ? "Depositing..." : "Deposit"}
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

          {depositMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
                  {depositMutation.error instanceof Error
                    ? depositMutation.error.message
                    : "Deposit failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
