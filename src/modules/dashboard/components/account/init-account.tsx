import React from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import { useInitializationAccountMutation } from "@/hooks/use-create";
import { useCheckWalletAccountQuery } from "@/hooks/use-check-wallet-account";

export const InitAccountComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { data: hasWalletAccount, isLoading: _isCheckingAccount } =
    useCheckWalletAccountQuery();
  const initAccountMutation = useInitializationAccountMutation();

  const checkOrCreateAptosAccount = async () => {
    if (!user?.address) return;

    try {
      await new Promise<any>((resolve, reject) => {
        initAccountMutation.mutate(
          { address: user.address },
          {
            onSuccess: (data) => {
              console.log("User created successfully:", data);
              resolve(data);
            },
            onError: (error) => {
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      console.error("Account initialization failed:", error);
      throw error;
    }
  };

  const handleInitAccount = () => {
    checkOrCreateAptosAccount().catch((error) => {
      console.error("Error in account initialization:", error);
    });
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
            Initialize Account
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to initialize your account.
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
          Initialize Account
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.300">
            Initialize your MoneyFi account on the blockchain.
          </Text>

          <Button
            onClick={handleInitAccount}
            loading={initAccountMutation.isPending}
            disabled={initAccountMutation.isPending || !!hasWalletAccount}
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
            {initAccountMutation.isPending
              ? "Initializing..."
              : "Initialize Account"}
          </Button>

          {initAccountMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
                  {initAccountMutation.error instanceof Error
                    ? initAccountMutation.error.message
                    : "Account initialization failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
