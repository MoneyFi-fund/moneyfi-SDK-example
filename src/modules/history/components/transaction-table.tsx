import React from "react";
import {
  Box,
  Text,
  Spinner,
  Badge,
  VStack,
  HStack,
  Button,
  Link as ChakraLink,
  Icon,
  Flex,
  Grid,
} from "@chakra-ui/react";
import {
  BiRefresh,
  BiLinkExternal,
  BiDownArrowCircle,
  BiUpArrowCircle,
  BiTransfer,
  BiGift,
  BiCoinStack,
  BiErrorCircle,
  BiHistory,
} from "react-icons/bi";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import type { Transaction, TransactionAction } from "@/types/transaction";
import {
  shortenAddress,
  formatValue,
  formatTransactionDate,
  formatTokenSymbol,
  getExplorerUrl,
  getNetworkName,
} from "../utils";

interface TransactionHistoryTableProps {
  data: Transaction[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

// Action configuration with colors and icons
const ACTION_CONFIG: Record<
  TransactionAction,
  { icon: React.ElementType; color: string; bgColor: string; label: string }
> = {
  deposit: {
    icon: BiDownArrowCircle,
    color: "success.600",
    bgColor: "success.50",
    label: "Deposit",
  },
  withdraw: {
    icon: BiUpArrowCircle,
    color: "error.600",
    bgColor: "error.50",
    label: "Withdraw",
  },
  rebalance: {
    icon: BiTransfer,
    color: "tertiary.600",
    bgColor: "tertiary.50",
    label: "Rebalance",
  },
  claim: {
    icon: BiGift,
    color: "secondary.600",
    bgColor: "secondary.50",
    label: "Claim",
  },
  distribute: {
    icon: BiCoinStack,
    color: "warning.600",
    bgColor: "warning.50",
    label: "Distribute",
  },
  transfer_fund: {
    icon: BiTransfer,
    color: "primary.600",
    bgColor: "primary.50",
    label: "Transfer",
  },
};

// Transaction Card for Mobile View
const TransactionCard: React.FC<{
  tx: Transaction;
  cardColors: ReturnType<typeof useThemeColors>["cardColors"];
}> = ({ tx, cardColors }) => {
  const config = ACTION_CONFIG[tx.action] || ACTION_CONFIG.deposit;
  const explorerUrl = getExplorerUrl(tx.chainId, tx.hash);
  const isDeposit = tx.action === "deposit";
  const isWithdraw = tx.action === "withdraw";

  return (
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
      <Flex justify="space-between" align="flex-start" mb={3}>
        {/* Action Badge */}
        <HStack gap={2}>
          <Box
            bg={config.bgColor}
            p={2}
            borderRadius={materialDesign3Theme.borderRadius.sm}
          >
            <Icon as={config.icon} color={config.color} boxSize={5} />
          </Box>
          <VStack align="start" gap={0}>
            <Text fontWeight="600" fontSize="sm" color={cardColors.text}>
              {config.label}
            </Text>
            <Badge
              variant="outline"
              colorPalette="gray"
              fontSize="xs"
              fontWeight="normal"
            >
              {getNetworkName(tx.chainId)}
            </Badge>
          </VStack>
        </HStack>

        {/* Amount */}
        <VStack align="end" gap={0}>
          <Text
            fontWeight="700"
            fontSize="md"
            color={
              isDeposit ? "success.600" : isWithdraw ? "error.600" : cardColors.text
            }
          >
            {isDeposit ? "+" : isWithdraw ? "-" : ""}
            {formatValue(tx.value)} {formatTokenSymbol(tx.token)}
          </Text>
          <Text fontSize="xs" color={cardColors.textSecondary}>
            {formatTransactionDate(tx.time)}
          </Text>
        </VStack>
      </Flex>

      {/* Transaction Hash */}
      {tx.hash && explorerUrl && (
        <Flex
          justify="space-between"
          align="center"
          pt={3}
          borderTop="1px solid"
          borderColor={cardColors.border}
        >
          <Text fontSize="xs" color={cardColors.textSecondary}>
            Transaction
          </Text>
          <ChakraLink
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary.500"
            fontSize="xs"
            fontFamily="mono"
            display="inline-flex"
            alignItems="center"
            gap={1}
            _hover={{ textDecoration: "underline" }}
          >
            {shortenAddress(tx.hash, 8)}
            <BiLinkExternal size={12} />
          </ChakraLink>
        </Flex>
      )}
    </Box>
  );
};

// Transaction Row for Desktop Table View
const TransactionRow: React.FC<{
  tx: Transaction;
  index: number;
  cardColors: ReturnType<typeof useThemeColors>["cardColors"];
}> = ({ tx, index, cardColors }) => {
  const config = ACTION_CONFIG[tx.action] || ACTION_CONFIG.deposit;
  const explorerUrl = getExplorerUrl(tx.chainId, tx.hash);
  const isDeposit = tx.action === "deposit";
  const isWithdraw = tx.action === "withdraw";

  return (
    <Grid
      templateColumns="1fr 1fr 1.5fr 1fr"
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
      {/* Action */}
      <HStack gap={3}>
        <Box
          bg={config.bgColor}
          p={2}
          borderRadius={materialDesign3Theme.borderRadius.xs}
          display={{ base: "none", lg: "flex" }}
        >
          <Icon as={config.icon} color={config.color} boxSize={4} />
        </Box>
        <VStack align="start" gap={0}>
          <HStack gap={2}>
            <Text fontWeight="600" fontSize="sm" color={cardColors.text}>
              {config.label}
            </Text>
          </HStack>
          <Badge
            variant="outline"
            colorPalette="gray"
            fontSize="10px"
            fontWeight="normal"
          >
            {getNetworkName(tx.chainId)}
          </Badge>
        </VStack>
      </HStack>

      {/* Amount */}
      <Text
        fontWeight="600"
        fontSize="sm"
        color={
          isDeposit ? "success.600" : isWithdraw ? "error.600" : cardColors.text
        }
        textAlign="left"
      >
        {isDeposit ? "+" : isWithdraw ? "-" : ""}
        {formatValue(tx.value)} {formatTokenSymbol(tx.token)}
      </Text>

      {/* Hash */}
      <Box textAlign="left">
        {tx.hash && explorerUrl ? (
          <ChakraLink
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            color="primary.500"
            fontSize="sm"
            fontFamily="mono"
            display="inline-flex"
            alignItems="center"
            gap={1}
            _hover={{ textDecoration: "underline" }}
          >
            {shortenAddress(tx.hash, 8)}
            <BiLinkExternal size={12} />
          </ChakraLink>
        ) : (
          <Text color={cardColors.textSecondary}>-</Text>
        )}
      </Box>

      {/* Time */}
      <Text
        fontSize="sm"
        color={cardColors.textSecondary}
        textAlign="right"
      >
        {formatTransactionDate(tx.time)}
      </Text>
    </Grid>
  );
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
        <Box
          position="relative"
          mb={4}
        >
          <Spinner
            size="xl"
            color="primary.500"
            borderWidth="4px"
            speed="0.8s"
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
        <Box
          bg="error.50"
          p={4}
          borderRadius="full"
          mb={4}
        >
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
          templateColumns="1fr 1fr 1.5fr 1fr"
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
            Action
          </Text>
          <Text
            fontSize="xs"
            fontWeight="600"
            color={cardColors.textSecondary}
            textTransform="uppercase"
            letterSpacing="wider"
            textAlign="left"
          >
            Amount
          </Text>
          <Text
            fontSize="xs"
            fontWeight="600"
            color={cardColors.textSecondary}
            textTransform="uppercase"
            letterSpacing="wider"
            textAlign="left"
          >
            Transaction
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
