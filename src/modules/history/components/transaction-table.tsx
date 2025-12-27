import React from "react";
import {
  Box,
  Text,
  Spinner,
  VStack,
  Button,
  Link as ChakraLink,
  Icon,
  Flex,
  Grid,
} from "@chakra-ui/react";
import {
  BiRefresh,
  BiLinkExternal,
  BiErrorCircle,
  BiHistory,
} from "react-icons/bi";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import type { Transaction } from "@/types/transaction";
import {
  shortenAddress,
  formatValue,
  formatTransactionDate,
  formatTokenSymbol,
  getExplorerUrl,
} from "../utils";

interface TransactionHistoryTableProps {
  data: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Capitalize first character of a string
 */
const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Format activity text based on transaction type
 * Follows moneyFi-dapp RecentTransaction.tsx format
 */
const formatActivity = (tx: Transaction): React.ReactNode => {
  const amount = formatValue(tx.value);
  const token = formatTokenSymbol(tx.token);
  const fromAddr = tx.fromAddress ? shortenAddress(tx.fromAddress, 4) : "";
  const toAddr = tx.toAddress ? shortenAddress(tx.toAddress, 4) : "";
  const toNetwork = tx.toNetwork ? capitalize(tx.toNetwork) : null;

  // Format protocol/strategy for transfer/distribute (capitalize protocol name)
  const protocolName = tx.protocolName ? capitalize(tx.protocolName) : "";
  const strategyInfo = protocolName && tx.strategyName
    ? `${protocolName} - ${tx.strategyName}`
    : tx.strategyName || protocolName || "";

  // Destination description (MoneyFi, strategy, or address)
  const destination = tx.toAddressType || (toAddr ? toAddr : "MoneyFi");

  switch (tx.action) {
    case "deposit":
      return (
        <Text as="span">
          <Text as="span" fontWeight="600">Deposit</Text>{" "}
          <Text as="span" fontWeight="700">{amount} {token}</Text>{" "}
          from {fromAddr}{" "}
          to {destination}
        </Text>
      );

    case "withdraw":
      return (
        <Text as="span">
          <Text as="span" fontWeight="600">Withdraw</Text>{" "}
          <Text as="span" fontWeight="700">{amount} {token}</Text>{" "}
          from {fromAddr}
          {toNetwork && (
            <>
              {" "}to{" "}
              <Text as="span" fontWeight="600" color="primary.500">{toNetwork}</Text>
            </>
          )}
        </Text>
      );

    case "transfer_fund":
    case "distribute":
      return (
        <Text as="span">
          <Text as="span" fontWeight="600">
            {tx.action === "transfer_fund" ? "Transfer" : "Distributed"}
          </Text>{" "}
          <Text as="span" fontWeight="700">{amount} {token}</Text>{" "}
          ➜ {fromAddr}{" "}
          {strategyInfo && (
            <>
              ➜ <Text as="span" fontWeight="600">{strategyInfo}</Text>
            </>
          )}
          {toNetwork && !strategyInfo && (
            <>
              ➜ <Text as="span" fontWeight="600" color="primary.500">{toNetwork}</Text>
            </>
          )}
        </Text>
      );

    case "rebalance":
      return (
        <Text as="span">
          <Text as="span" fontWeight="600">Rebalance</Text>{" "}
          <Text as="span" fontWeight="700">{amount} {token}</Text>{" "}
          of {fromAddr || toAddr}
        </Text>
      );

    case "claim":
      return (
        <Text as="span">
          <Text as="span" fontWeight="600">Claim</Text>{" "}
          <Text as="span" fontWeight="700">{amount} {token}</Text>{" "}
          from {toAddr}{" "}
          to {fromAddr}
        </Text>
      );

    default:
      return (
        <Text as="span">
          <Text as="span" fontWeight="600">{tx.action}</Text>{" "}
          <Text as="span" fontWeight="700">{amount} {token}</Text>{" "}
          {fromAddr && <>from {fromAddr}</>}
        </Text>
      );
  }
};

/**
 * Get text color based on action type
 */
const getActionTextColor = (action: string): string => {
  switch (action) {
    case "deposit":
    case "claim":
    case "distribute":
    case "transfer_fund":
      return "success.600";
    case "withdraw":
    case "rebalance":
      return "error.600";
    default:
      return "inherit";
  }
};

// Transaction Row for Desktop Table View
const TransactionRow: React.FC<{
  tx: Transaction;
  index: number;
  cardColors: ReturnType<typeof useThemeColors>["cardColors"];
}> = ({ tx, index, cardColors }) => {
  const explorerUrl = getExplorerUrl(tx.chainId, tx.hash);
  const textColor = getActionTextColor(tx.action);

  const rowContent = (
    <Grid
      templateColumns="1fr auto"
      gap={4}
      px={4}
      py={3}
      bg={index % 2 === 0 ? "transparent" : cardColors.background}
      _hover={{
        bg: "primary.50",
        _dark: { bg: "whiteAlpha.50" },
      }}
      transition="background 0.2s"
      alignItems="center"
    >
      {/* Activity */}
      <Text fontSize="sm" color={textColor}>
        {formatActivity(tx)}
      </Text>

      {/* Time */}
      <Text
        fontSize="sm"
        color={cardColors.textSecondary}
        textAlign="right"
        whiteSpace="nowrap"
      >
        {formatTransactionDate(tx.time)}
      </Text>
    </Grid>
  );

  // Wrap in link if explorer URL available
  if (explorerUrl) {
    return (
      <ChakraLink
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        _hover={{ textDecoration: "none" }}
        display="block"
      >
        {rowContent}
      </ChakraLink>
    );
  }

  return rowContent;
};

// Transaction Card for Mobile View
const TransactionCard: React.FC<{
  tx: Transaction;
  cardColors: ReturnType<typeof useThemeColors>["cardColors"];
}> = ({ tx, cardColors }) => {
  const explorerUrl = getExplorerUrl(tx.chainId, tx.hash);
  const textColor = getActionTextColor(tx.action);

  const cardContent = (
    <Box
      bg={cardColors.background}
      borderRadius={materialDesign3Theme.borderRadius.md}
      border="1px solid"
      borderColor={cardColors.border}
      p={4}
      transition="all 0.2s"
      _hover={{
        boxShadow: materialDesign3Theme.elevation.level2,
        borderColor: "primary.200",
      }}
    >
      {/* Activity */}
      <Text fontSize="sm" color={textColor} mb={2}>
        {formatActivity(tx)}
      </Text>

      {/* Time and Link */}
      <Flex
        justify="space-between"
        align="center"
        pt={2}
        borderTop="1px solid"
        borderColor={cardColors.border}
      >
        <Text fontSize="xs" color={cardColors.textSecondary}>
          {formatTransactionDate(tx.time)}
        </Text>
        {tx.hash && explorerUrl && (
          <Text
            fontSize="xs"
            fontFamily="mono"
            color="primary.500"
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            {shortenAddress(tx.hash, 6)}
            <BiLinkExternal size={12} />
          </Text>
        )}
      </Flex>
    </Box>
  );

  // Wrap in link if explorer URL available
  if (explorerUrl) {
    return (
      <ChakraLink
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        _hover={{ textDecoration: "none" }}
        display="block"
      >
        {cardContent}
      </ChakraLink>
    );
  }

  return cardContent;
};

export const TransactionHistoryTable: React.FC<TransactionHistoryTableProps> = ({
  data,
  isLoading,
  isError,
  refetch,
}) => {
  const { cardColors } = useThemeColors();

  // Loading state
  if (isLoading) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        py={16}
        px={8}
        minH="300px"
      >
        <Box position="relative" mb={4}>
          <Spinner
            size="xl"
            color="primary.500"
            borderWidth="4px"
          />
        </Box>
        <Text
          fontSize={materialDesign3Theme.typography.titleMedium.fontSize}
          fontWeight="medium"
          color={cardColors.text}
          mb={1}
        >
          Loading Transactions
        </Text>
        <Text
          fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
          color={cardColors.textSecondary}
        >
          Fetching your transaction history...
        </Text>
      </Flex>
    );
  }

  // Error state
  if (isError) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        py={16}
        px={8}
        minH="300px"
      >
        <Box bg="error.50" p={4} borderRadius="full" mb={4}>
          <Icon as={BiErrorCircle} color="error.500" boxSize={10} />
        </Box>
        <Text
          fontSize={materialDesign3Theme.typography.titleMedium.fontSize}
          fontWeight="medium"
          color={cardColors.text}
          mb={1}
        >
          Failed to Load
        </Text>
        <Text
          fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
          color={cardColors.textSecondary}
          mb={4}
          textAlign="center"
        >
          We couldn't fetch your transactions. Please try again.
        </Text>
        <Button
          onClick={() => refetch()}
          size="sm"
          bg="error.500"
          color="white"
          _hover={{ bg: "error.600" }}
          borderRadius={materialDesign3Theme.borderRadius.sm}
        >
          <Icon as={BiRefresh} mr={2} />
          Try Again
        </Button>
      </Flex>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        py={16}
        px={8}
        minH="300px"
      >
        <Box
          bg="neutral.100"
          _dark={{ bg: "neutral.800" }}
          p={4}
          borderRadius="full"
          mb={4}
        >
          <Icon as={BiHistory} color="neutral.400" boxSize={10} />
        </Box>
        <Text
          fontSize={materialDesign3Theme.typography.titleMedium.fontSize}
          fontWeight="medium"
          color={cardColors.text}
          mb={1}
        >
          No Transactions Yet
        </Text>
        <Text
          fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
          color={cardColors.textSecondary}
          textAlign="center"
          maxW="280px"
        >
          Your transaction history will appear here once you make your first deposit or withdrawal.
        </Text>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Desktop Table View */}
      <Box display={{ base: "none", md: "block" }}>
        {/* Table Header */}
        <Grid
          templateColumns="1fr auto"
          gap={4}
          px={4}
          py={3}
          bg={cardColors.background}
          borderBottom="1px solid"
          borderColor={cardColors.border}
        >
          <Text
            fontSize="xs"
            fontWeight="600"
            color={cardColors.textSecondary}
            textTransform="uppercase"
            letterSpacing="wider"
          >
            System Activities
          </Text>
          <Text
            fontSize="xs"
            fontWeight="600"
            color={cardColors.textSecondary}
            textTransform="uppercase"
            letterSpacing="wider"
            textAlign="right"
          >
            Time
          </Text>
        </Grid>

        {/* Table Body */}
        <Box maxH="500px" overflowY="auto">
          {data.map((tx, index) => (
            <TransactionRow
              key={tx.id}
              tx={tx}
              index={index}
              cardColors={cardColors}
            />
          ))}
        </Box>
      </Box>

      {/* Mobile Card View */}
      <Box display={{ base: "block", md: "none" }} p={4}>
        <VStack gap={3} align="stretch">
          {data.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} cardColors={cardColors} />
          ))}
        </VStack>
      </Box>
    </Box>
  );
};
