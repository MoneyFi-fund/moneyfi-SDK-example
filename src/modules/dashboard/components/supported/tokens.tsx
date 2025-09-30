import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Skeleton,
  Heading,
  Image,
  Flex,
  Grid,
} from "@chakra-ui/react";
import { useGetSupportedTokens } from "@/hooks/use-moneyfi-queries";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { getTokenIcon } from "@/utils/supported";

const SupportedTokens: React.FC = () => {
  const {
    data: supportedTokens,
    isLoading,
    error,
    isError,
  } = useGetSupportedTokens();
  const { cardColors } = useThemeColors();

  if (isLoading) {
    return (
      <Box
        p={6}
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        border="1px solid"
        borderColor={cardColors.border}
      >
        <Heading
          size="md"
          mb={4}
          color={cardColors.text}
          fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
          fontWeight="medium"
        >
          Supported Tokens
        </Heading>
        <Grid templateColumns="repeat(8, 1fr)" gap={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              height="60px"
              borderRadius="md"
            />
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        p={6}
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        border="1px solid"
        borderColor={cardColors.border}
      >
        <Heading
          size="md"
          mb={4}
          color={cardColors.text}
          fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
          fontWeight="medium"
        >
          Supported Tokens
        </Heading>
        <Box
          p={4}
          borderRadius={materialDesign3Theme.borderRadius.sm}
          bg="error.50"
          border="1px"
          borderColor="error.200"
        >
          <Text color="error.800" fontWeight="bold" mb={2}>
            Error Loading Tokens!
          </Text>
          <Text color="error.700" fontSize="sm">
            {error instanceof Error
              ? error.message
              : "Failed to load supported tokens"}
          </Text>
        </Box>
      </Box>
    );
  }

  if (
    !supportedTokens ||
    (Array.isArray(supportedTokens) && supportedTokens.length === 0)
  ) {
    return (
      <Box
        p={6}
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        border="1px solid"
        borderColor={cardColors.border}
      >
        <Heading
          size="md"
          mb={4}
          color={cardColors.text}
          fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
          fontWeight="medium"
        >
          Supported Tokens
        </Heading>
        <Box
          p={4}
          borderRadius={materialDesign3Theme.borderRadius.sm}
          bg="blue.50"
          border="1px"
          borderColor="blue.200"
        >
          <Text color="blue.600" fontWeight="bold" mb={2}>
            No Tokens Available
          </Text>
          <Text color="blue.600" fontSize="sm">
            No supported tokens found at the moment.
          </Text>
        </Box>
      </Box>
    );
  }

  const renderTokenData = () => {
    // Handle different possible response structures
    if (Array.isArray(supportedTokens)) {
      return supportedTokens.map((token: any, index: number) => {
        const tokenSymbol = token.name || token.symbol || token.token_symbol;
        const customIcon = getTokenIcon(tokenSymbol);
        const iconSrc = customIcon || token.logo_url;

        return (
          <Box
            key={
              token.address || token.contract_address || token.symbol || index
            }
            p={3}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            border="1px"
            borderColor={cardColors.border}
            bg={cardColors.background}
            transition="all 0.2s ease"
          >
            <HStack justify="space-between" align="center" width="100%">
              <Flex align="center" gap={3}>
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt={tokenSymbol || "Token"}
                    boxSize="24px"
                    borderRadius="full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallbackDiv = (e.target as HTMLImageElement)
                        .nextElementSibling as HTMLElement;
                      if (fallbackDiv) fallbackDiv.style.display = "flex";
                    }}
                  />
                ) : null}
                <Box
                  w="24px"
                  h="24px"
                  bg="gray.200"
                  borderRadius="full"
                  display={iconSrc ? "none" : "flex"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    {(tokenSymbol || "?").slice(0, 2).toUpperCase()}
                  </Text>
                </Box>
                <VStack align="start" gap={0}>
                  <Text
                    fontWeight="medium"
                    fontSize="sm"
                    color={cardColors.text}
                  >
                    {token.name || "Unknown Token"}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize="xs" color={cardColors.textSecondary}>
                      {token.chain}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </HStack>
          </Box>
        );
      });
    } else if (
      supportedTokens &&
      typeof supportedTokens === "object" &&
      supportedTokens.tokens
    ) {
      // Handle object response with tokens array
      return supportedTokens.tokens.map((token: any, index: number) => {
        const tokenSymbol = token.name || token.symbol || token.token_symbol;
        const customIcon = getTokenIcon(tokenSymbol);
        const iconSrc = customIcon || token.logo_url;

        return (
          <Box
            key={
              token.address || token.contract_address || token.symbol || index
            }
            p={3}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            border="1px"
            borderColor={cardColors.border}
            bg={cardColors.background}
            transition="all 0.2s ease"
            _hover={{
              boxShadow: materialDesign3Theme.elevation.level2,
            }}
          >
            <HStack justify="space-between" align="center" width="100%">
              <Flex align="center" gap={3}>
                {iconSrc ? (
                  <Image
                    src={iconSrc}
                    alt={tokenSymbol || "Token"}
                    boxSize="24px"
                    borderRadius="full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      const fallbackDiv = (e.target as HTMLImageElement)
                        .nextElementSibling as HTMLElement;
                      if (fallbackDiv) fallbackDiv.style.display = "flex";
                    }}
                  />
                ) : null}
                <Box
                  w="24px"
                  h="24px"
                  bg="gray.200"
                  borderRadius="full"
                  display={iconSrc ? "none" : "flex"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">
                    {(tokenSymbol || "?").slice(0, 2).toUpperCase()}
                  </Text>
                </Box>
                <VStack align="start" gap={0}>
                  <Text
                    fontWeight="medium"
                    fontSize="sm"
                    color={cardColors.text}
                  >
                    {token.name || "Unknown Token"}
                  </Text>
                  <HStack gap={2}>
                    <Text fontSize="xs" color={cardColors.textSecondary}>
                      {token.chain}
                    </Text>
                  </HStack>
                </VStack>
              </Flex>
            </HStack>
          </Box>
        );
      });
    } else {
      return null;
    }
  };

  return (
    <Box
      p={6}
      bg={cardColors.background}
      borderRadius={materialDesign3Theme.borderRadius.md}
      boxShadow={materialDesign3Theme.elevation.level1}
      border="1px solid"
      borderColor={cardColors.border}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        boxShadow: materialDesign3Theme.elevation.level2,
      }}
    >
      <Heading
        size="md"
        mb={4}
        color={cardColors.text}
        fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
        fontWeight="medium"
      >
        Supported Tokens
      </Heading>
      <Grid templateColumns="repeat(8, 1fr)" gap={2}>
        {renderTokenData()}
      </Grid>
    </Box>
  );
};

export default SupportedTokens;
