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
} from "@chakra-ui/react";
import { useGetSupportedChains } from "@/hooks/use-moneyfi-queries";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";

const SupportedChains: React.FC = () => {
  const {
    data: supportedChains,
    isLoading,
    error,
    isError,
  } = useGetSupportedChains();
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
          Supported Chains
        </Heading>
        <VStack gap={4}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height="100px" width="100%" borderRadius="md" />
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
          Supported Chains
        </Heading>
        <Box 
          p={4} 
          borderRadius={materialDesign3Theme.borderRadius.sm} 
          bg="error.50" 
          border="1px" 
          borderColor="error.200"
        >
          <Text color="error.800" fontWeight="bold" mb={2}>
            Error Loading Chains!
          </Text>
          <Text color="error.700" fontSize="sm">
            {error instanceof Error ? error.message : "Failed to load supported chains"}
          </Text>
        </Box>
      </Box>
    );
  }

  if (!supportedChains || (Array.isArray(supportedChains) && supportedChains.length === 0)) {
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
          Supported Chains
        </Heading>
        <Box 
          p={4} 
          borderRadius={materialDesign3Theme.borderRadius.sm} 
          bg="blue.50" 
          border="1px" 
          borderColor="blue.200"
        >
          <Text color="blue.600" fontWeight="bold" mb={2}>
            No Chains Available
          </Text>
          <Text color="blue.600" fontSize="sm">
            No supported chains found at the moment.
          </Text>
        </Box>
      </Box>
    );
  }

  const renderChainData = () => {
    // Handle different possible response structures
    if (Array.isArray(supportedChains)) {
      return supportedChains.map((chain: any, index: number) => (
        <GridItem key={chain.id || chain.chain_id || index}>
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
            <VStack align="start" gap={2}>
              <HStack justify="space-between" width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize="sm"
                  color={cardColors.text}
                >
                  {chain.name || chain.chain_name || `Chain ${chain.id || chain.chain_id || index}`}
                </Text>
                <Badge colorScheme={chain.active ? "green" : "gray"} size="sm">
                  {chain.active ? "Active" : "Inactive"}
                </Badge>
              </HStack>
              {chain.id && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  ID: {chain.id}
                </Text>
              )}
              {chain.chain_id && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  Chain ID: {chain.chain_id}
                </Text>
              )}
              {chain.network && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  Network: {chain.network}
                </Text>
              )}
              {chain.description && (
                <Text fontSize="xs" color={cardColors.textSecondary}>
                  {chain.description}
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
              <Box as="pre" fontSize="xs" overflow="auto" maxH="200px" color={cardColors.textSecondary}>
                {JSON.stringify(supportedChains, null, 2)}
              </Box>
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
        Supported Chains
      </Heading>
      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
        {renderChainData()}
      </Grid>
    </Box>
  );
};

export default SupportedChains;