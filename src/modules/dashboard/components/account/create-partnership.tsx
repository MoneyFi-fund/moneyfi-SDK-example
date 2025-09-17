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
import { materialDesign3Theme } from "@/theme/material-design-3";
import { MdContentCopy, MdCheck } from "react-icons/md";
import { useAuth } from "@/provider/auth-provider";
import { useThemeColors } from "@/provider/theme-provider";
import { useGetOrCreatePartnershipMutation } from "@/hooks/use-create";

export const CreatePartnershipComponent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { cardColors, buttonColors } = useThemeColors();
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
        console.error("Failed to copy:", err);
      }
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
            Create Partnership
          </Text>
        </Card.Header>
        <Card.Body px={6} pb={6}>
          <Text
            color={cardColors.textSecondary}
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            Please connect your wallet to create a partnership.
          </Text>
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
          Create Partnership
        </Text>
      </Card.Header>
      <Card.Body px={6} pb={6}>
        <VStack align="stretch" gap={6}>
          <Text
            fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
            color={cardColors.textSecondary}
            lineHeight={materialDesign3Theme.typography.bodyMedium.lineHeight}
          >
            Create or retrieve your partnership account on MoneyFi.
          </Text>

          <Button
            onClick={handleCreatePartnership}
            loading={createPartnershipMutation.isPending}
            disabled={createPartnershipMutation.isPending}
            bg={buttonColors.secondary.background}
            color={buttonColors.secondary.text}
            minH="48px"
            px={6}
            borderRadius="sm"
            fontWeight="medium"
            fontSize="label-lg"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            boxShadow="sm"
            _hover={{
              bg: buttonColors.secondary.hover,
              boxShadow: "md",
            }}
            _active={{
              bg: buttonColors.secondary.active,
              boxShadow: "sm",
            }}
            _loading={{
              bg: buttonColors.secondary.disabled,
            }}
            _disabled={{
              bg: buttonColors.secondary.disabled,
              color: cardColors.textSecondary,
              cursor: "not-allowed",
              boxShadow: "none",
            }}
          >
            {createPartnershipMutation.isPending
              ? "Creating Partnership..."
              : "Create Partnership"}
          </Button>

          {successData ? (
            <Alert.Root
              status="success"
              borderColor="success.200"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              p={4}
            >
              <Alert.Description>
                <VStack align="stretch" gap={3}>
                  <Text
                    fontWeight="medium"
                    fontSize={
                      materialDesign3Theme.typography.labelLarge.fontSize
                    }
                  >
                    Partnership created successfully!
                  </Text>
                  <HStack justify="space-between" align="center">
                    <Text
                      fontSize={
                        materialDesign3Theme.typography.bodySmall.fontSize
                      }
                    >
                      Partnership ID: {successData.ref_code || "N/A"}
                    </Text>
                    {successData?.ref_code && (
                      <IconButton
                        onClick={handleCopy}
                        size="sm"
                        variant="ghost"
                        color="success.600"
                        borderRadius={materialDesign3Theme.borderRadius.xs}
                        _hover={{
                          color: "success.700",
                          bg: "success.100",
                        }}
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
              bg="error.50"
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
