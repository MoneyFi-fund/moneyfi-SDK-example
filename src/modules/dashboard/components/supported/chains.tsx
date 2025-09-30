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
import { useGetSupportedChains } from "@/hooks/use-moneyfi-queries";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { getNetworkIcon, getNetworkType } from "@/utils/supported";

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
        minH="200px"
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
        <Grid
          templateColumns="repeat(8, 1fr)"
          gap={3}
          overflowX="auto"
          pb={2}
          css={{
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background: cardColors.border,
              borderRadius: "3px",
            },
          }}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton
              key={index}
              height="80px"
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
        minH="200px"
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
            {error instanceof Error
              ? error.message
              : "Failed to load supported chains"}
          </Text>
        </Box>
      </Box>
    );
  }

  if (
    !supportedChains ||
    (Array.isArray(supportedChains) && supportedChains.length === 0)
  ) {
    return (
      <Box
        p={6}
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        border="1px solid"
        borderColor={cardColors.border}
        minH="200px"
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
      return supportedChains.map((chain: any, index: number) => {
        const chainName =
          chain.name ||
          chain.chain_name ||
          `Chain ${chain.id || chain.chain_id || index}`;
        const networkIcon = getNetworkIcon(chainName);
        const networkType = getNetworkType(chainName);

        return (
          <Box
            key={chain.id || chain.chain_id || index}
            p={4}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            border="1px"
            borderColor={cardColors.border}
            bg={cardColors.background}
            transition="all 0.2s ease"
            _hover={{
              boxShadow: materialDesign3Theme.elevation.level2,
            }}
          >
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Flex align="center" gap={3}>
                  {networkIcon ? (
                    <Image
                      src={networkIcon}
                      alt={chainName}
                      boxSize="24px"
                      borderRadius="md"
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
                    borderRadius="md"
                    display={networkIcon ? "none" : "flex"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      {chainName.slice(0, 2).toUpperCase()}
                    </Text>
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text
                      fontWeight="medium"
                      fontSize="sm"
                      color={cardColors.text}
                    >
                      {chainName}
                    </Text>
                    {networkType && (
                      <Badge
                        variant="outline"
                        size="xs"
                        colorScheme={networkType === "evm" ? "blue" : "purple"}
                      >
                        {networkType.toUpperCase()}
                      </Badge>
                    )}
                  </VStack>
                </Flex>
              </HStack>
              <Badge
                colorScheme={chain.active !== false ? "green" : "gray"}
                size="sm"
                alignSelf="flex-start"
              >
                {chain.active !== false ? "Active" : "Inactive"}
              </Badge>
            </VStack>
          </Box>
        );
      });
    } else if (supportedChains && typeof supportedChains === "object") {
      // Handle object response with network types as keys
      const chains: any[] = [];

      Object.entries(supportedChains).forEach(([networkType, chainData]) => {
        if (Array.isArray(chainData)) {
          chainData.forEach((chainName: string) => {
            chains.push({
              name: chainName,
              network_type: networkType,
              active: true,
            });
          });
        } else if (typeof chainData === "string") {
          chains.push({
            name: chainData,
            network_type: networkType,
            active: true,
          });
        }
      });

      return chains.map((chain: any, index: number) => {
        const chainName = chain.name;
        const networkIcon = getNetworkIcon(chainName);
        const networkType = getNetworkType(chainName) || chain.network_type;

        return (
          <Box
            key={`${chain.network_type}-${chainName}-${index}`}
            p={4}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            border="1px"
            borderColor={cardColors.border}
            bg={cardColors.background}
            transition="all 0.2s ease"
            _hover={{
              boxShadow: materialDesign3Theme.elevation.level2,
            }}
          >
            <VStack align="start" gap={3}>
              <HStack justify="space-between" width="100%">
                <Flex align="center" gap={3}>
                  {networkIcon ? (
                    <Image
                      src={networkIcon}
                      alt={chainName}
                      boxSize="24px"
                      borderRadius="md"
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
                    borderRadius="md"
                    display={networkIcon ? "none" : "flex"}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xs" color="gray.500" fontWeight="bold">
                      {chainName.slice(0, 2).toUpperCase()}
                    </Text>
                  </Box>
                  <VStack align="start" gap={0}>
                    <Text
                      fontWeight="medium"
                      fontSize="sm"
                      color={cardColors.text}
                    >
                      {chainName}
                    </Text>
                    {networkType && (
                      <Badge
                        variant="outline"
                        size="xs"
                        colorScheme={networkType === "evm" ? "blue" : "purple"}
                      >
                        {networkType.toUpperCase()}
                      </Badge>
                    )}
                  </VStack>
                </Flex>
              </HStack>
            </VStack>
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
        Supported Chains
      </Heading>
      <Grid templateColumns="repeat(8, 1fr)" gap={2}>
        {renderChainData()}
      </Grid>
    </Box>
  );
};

export default SupportedChains;
