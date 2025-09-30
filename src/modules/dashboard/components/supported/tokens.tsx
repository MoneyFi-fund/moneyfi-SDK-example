import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Skeleton,
  Heading,
  Grid,
  GridItem,
  Image,
  Flex,
} from "@chakra-ui/react";
import { useGetSupportedTokens } from "@/hooks/use-moneyfi-queries";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";

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
        <VStack gap={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height="120px" width="100%" borderRadius="md" />
          ))}
        </VStack>
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
            {error instanceof Error ? error.message : "Failed to load supported tokens"}
          </Text>
        </Box>
      </Box>
    );
  }

  if (!supportedTokens || (Array.isArray(supportedTokens) && supportedTokens.length === 0)) {
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
      return supportedTokens.map((token: any, index: number) => (
        <GridItem key={token.address || token.contract_address || token.symbol || index}>
          <Box 
            p={4} 
            borderRadius={materialDesign3Theme.borderRadius.sm} 
            border="1px" 
            borderColor={cardColors.border} 
            bg={cardColors.background}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
              boxShadow: materialDesign3Theme.elevation.level2,
              transform: "translateY(-2px)",
            }}
          >
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Flex align="center" gap={2}>
                  {token.logo_url && (
                    <Box>
                      <Image
                        src={token.logo_url}
                        alt={token.symbol || "Token"}
                        boxSize="24px"
                        borderRadius="full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <Box 
                        w="24px" 
                        h="24px" 
                        bg="gray.200" 
                        borderRadius="full" 
                        display="none"
                        _peerInvalid={{ display: "block" }}
                      />
                    </Box>
                  )}
                  <VStack align="start" gap={0}>
                    <Text 
                      fontWeight="bold" 
                      fontSize="sm"
                      color={cardColors.text}
                    >
                      {token.name || token.token_name || "Unknown Token"}
                    </Text>
                    {token.symbol && (
                      <Text fontSize="xs" color={cardColors.textSecondary}>
                        {token.symbol}
                      </Text>
                    )}
                  </VStack>
                </Flex>
                <Badge colorScheme={token.active !== false ? "green" : "gray"} size="sm">
                  {token.active !== false ? "Active" : "Inactive"}
                </Badge>
              </HStack>
              
              {(token.address || token.contract_address) && (
                <Text fontSize="xs" color={cardColors.textSecondary} fontFamily="mono">
                  Address: {(token.address || token.contract_address).slice(0, 10)}...
                  {(token.address || token.contract_address).slice(-8)}
                </Text>
              )}
              
              {token.decimals && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  Decimals: {token.decimals}
                </Text>
              )}
              
              {token.chain_id && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  Chain ID: {token.chain_id}
                </Text>
              )}
              
              {token.type && (
                <Badge variant="outline" size="sm">
                  {token.type}
                </Badge>
              )}
              
              {token.description && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  {token.description}
                </Text>
              )}
            </VStack>
          </Box>
        </GridItem>
      ));
    } else {
      // Handle object response
      return (
        <GridItem>
          <Box 
            borderRadius={materialDesign3Theme.borderRadius.sm} 
            border="1px" 
            borderColor={cardColors.border} 
            bg={cardColors.background}
          >
            <VStack align="start" gap={2}>
              <Box as="pre" fontSize="xs" overflow="auto" maxH="200px" color={cardColors.textSecondary}>
                {JSON.stringify(supportedTokens, null, 2)}
              </Box>
            </VStack>
          </Box>
        </GridItem>
      );
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
      <Grid templateColumns="repeat(auto-fill, minmax(350px, 1fr))" gap={4}>
        {renderTokenData()}
      </Grid>
    </Box>
  );
};

export default SupportedTokens;