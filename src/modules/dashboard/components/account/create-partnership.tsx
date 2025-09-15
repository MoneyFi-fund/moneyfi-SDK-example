import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Button,
  Alert,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { MdContentCopy, MdCheck } from "react-icons/md";
import { useAuth } from "@/provider/auth-provider";
import { useGetOrCreatePartnershipMutation } from "@/hooks/use-create";

export const CreatePartnershipComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [successData, setSuccessData] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  
  const createPartnershipMutation = useGetOrCreatePartnershipMutation();

  const handleCreatePartnership = async () => {
    if (!user?.address) return;

    setSuccessData(null);
    setCopied(false);

    createPartnershipMutation.mutate(
      { address: user.address },
      {
        onSuccess: (data) => {
          setSuccessData(data);
        },
      }
    );
  };

  const handleCopy = async () => {
    if (successData?.ref_code) {
      try {
        await navigator.clipboard.writeText(successData.ref_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
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
            Create Partnership
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color="gray.400">
            Please connect your wallet to create a partnership.
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
          Create Partnership
        </Text>
      </Card.Header>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Text fontSize="sm" color="gray.300">
            Create or retrieve your partnership account on MoneyFi.
          </Text>

          <Button
            onClick={handleCreatePartnership}
            loading={createPartnershipMutation.isPending}
            disabled={createPartnershipMutation.isPending}
            bg="purple.500"
            color="white"
            size="md"
            border="3px solid white"
            borderRadius="0"
            boxShadow="5px 5px 0px white"
            transition="all 0.3s ease"
            fontWeight="bold"
            _hover={{
              bg: "purple.400",
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px white",
            }}
            _active={{
              transform: "translate(4px, 4px)",
              boxShadow: "1px 1px 0px white",
            }}
            _loading={{
              bg: "purple.400",
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
            {createPartnershipMutation.isPending ? "Creating Partnership..." : "Create Partnership"}
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
                    Partnership created successfully!
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Text fontSize="sm" color="green.200">
                      Partnership ID: {successData.ref_code || "N/A"}
                    </Text>
                    {successData?.ref_code && (
                      <IconButton
                        onClick={handleCopy}
                        size="sm"
                        variant="ghost"
                        color="green.300"
                        _hover={{ color: "green.100", bg: "green.800" }}
                        aria-label="Copy partnership ID"
                      >
                        {copied ? <MdCheck /> : <MdContentCopy />}
                      </IconButton>
                    )}
                  </HStack>
                  
                </VStack>
              </Alert.Description>
            </Alert.Root>
          ) : null}

          {createPartnershipMutation.isError && (
            <Alert.Root
              status="error"
              bg="red.900"
              border="2px solid red.400"
              borderRadius="0"
              boxShadow="4px 4px 0px red.400"
            >
              <Alert.Description>
                <Text color="red.100" fontWeight="bold">
                  {createPartnershipMutation.error instanceof Error
                    ? createPartnershipMutation.error.message
                    : "Partnership creation failed"}
                </Text>
              </Alert.Description>
            </Alert.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};