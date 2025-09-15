import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Input,
  Alert,
} from "@chakra-ui/react";
import { useAuth } from "@/provider/auth-provider";
import { useGetOrCreateUserMutation } from "@/hooks/use-create";

export const CreateUserComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [refBy, setRefBy] = useState("");
  const [successData, setSuccessData] = useState<any | null>(null);
  
  const createUserMutation = useGetOrCreateUserMutation();

  const handleCreateUser = async () => {
    if (!user?.address) return;

    setSuccessData(null);

    createUserMutation.mutate(
      { 
        address: user.address,
        refBy: refBy.trim() || undefined
      },
      {
        onSuccess: (data) => {
          setRefBy("");
          setSuccessData(data);
        },
      }
    );
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
            Create User
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to create a user account.
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
          Create User
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.300">
            Create or retrieve your user account on MoneyFi.
          </Text>

          <VStack align="stretch" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="white">
              Referral Code (Optional)
            </Text>
            <Input
              type="text"
              placeholder="Enter referral code"
              value={refBy}
              onChange={(e) => setRefBy(e.target.value)}
              border="2px solid white"
              borderRadius="0"
              color="white"
              bg="black"
              _focus={{
                borderColor: "blue.400",
                boxShadow: "3px 3px 0px blue.400",
              }}
              _hover={{
                borderColor: "gray.300",
              }}
            />
          </VStack>

          <Button
            onClick={handleCreateUser}
            loading={createUserMutation.isPending}
            disabled={createUserMutation.isPending}
            bg="green.500"
            color="white"
            size="md"
            border="3px solid white"
            borderRadius="0"
            boxShadow="5px 5px 0px white"
            transition="all 0.3s ease"
            fontWeight="bold"
            _hover={{
              bg: "green.400",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px white",
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px white",
            }}
            _loading={{
              bg: "green.400",
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
            {createUserMutation.isPending ? "Creating User..." : "Create User"}
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
                    User created successfully!
                  </Text>
                  <Text fontSize="sm" color="green.200">
                    User ID: {successData.id || "N/A"}
                  </Text>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {createUserMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
                  {createUserMutation.error instanceof Error
                    ? createUserMutation.error.message
                    : "User creation failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};