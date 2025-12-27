import React from "react";
import {
  Card,
  VStack,
  Text,
  Box,
  Alert,
  Container,
  HStack,
  Button,
  Icon,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { BiRefresh, BiWallet, BiHistory } from "react-icons/bi";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useThemeColors } from "@/provider/theme-provider";
import { useAuth } from "@/provider/auth-provider";
import { useTransactionHistoryQuery } from "@/hooks/common/use-transaction-history";
import { TransactionHistoryTable } from "./components/transaction-table";

export const HistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { cardColors, colors, buttonColors } = useThemeColors();
  const { data, isLoading, isError, refetch, isFetching } =
    useTransactionHistoryQuery();

  // Not authenticated - show connect wallet message
  if (!isAuthenticated) {
    return (
      <Box minH="60vh" bg={colors.background}>
        <Container maxW="full" p={{ base: 4, md: 6 }}>
          <VStack align="stretch" gap={6}>
            {/* Header */}
            <HStack justify="space-between" align="center">
              <HStack gap={3}>
                <Box
                  bg="primary.50"
                  p={2}
                  borderRadius={materialDesign3Theme.borderRadius.sm}
                >
                  <Icon as={BiHistory} color="primary.500" boxSize={6} />
                </Box>
                <Text
                  as="h1"
                  fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
                  fontWeight="medium"
                  color={colors.onBackground}
                >
                  Transaction History
                </Text>
              </HStack>
            </HStack>

            {/* Connect Wallet Alert */}
            <Card.Root
              bg={cardColors.background}
              borderRadius={materialDesign3Theme.borderRadius.md}
              boxShadow={materialDesign3Theme.elevation.level1}
              border="1px solid"
              borderColor={cardColors.border}
              overflow="hidden"
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={16}
                px={8}
              >
                <Box
                  bg="warning.50"
                  p={4}
                  borderRadius="full"
                  mb={4}
                >
                  <Icon as={BiWallet} color="warning.500" boxSize={10} />
                </Box>
                <Text
                  fontSize={materialDesign3Theme.typography.titleMedium.fontSize}
                  fontWeight="medium"
                  color={cardColors.text}
                  mb={1}
                >
                  Wallet Not Connected
                </Text>
                <Text
                  fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                  color={cardColors.textSecondary}
                  textAlign="center"
                  maxW="300px"
                >
                  Please connect your wallet to view your transaction history.
                </Text>
              </Flex>
            </Card.Root>
          </VStack>
        </Container>
      </Box>
    );
  }

  const transactionCount = data?.nodes?.length ?? 0;

  return (
    <VStack align="stretch" gap={6} p={{ base: 4, md: 6 }}>
      {/* Header with Title and Controls */}
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={4}
      >
        <HStack gap={3}>
          <Box
            bg="primary.50"
            p={2}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            display={{ base: "none", sm: "flex" }}
          >
            <Icon as={BiHistory} color="primary.500" boxSize={6} />
          </Box>
          <VStack align="start" gap={0}>
            <Text
              as="h1"
              fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
              fontWeight="medium"
              color={cardColors.text}
            >
              Transaction History
            </Text>
            {!isLoading && transactionCount > 0 && (
              <Text
                fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                color={cardColors.textSecondary}
              >
                {transactionCount} transaction{transactionCount !== 1 ? "s" : ""} found
              </Text>
            )}
          </VStack>
        </HStack>

        {/* Refresh Button */}
        <Button
          onClick={() => refetch()}
          loading={isFetching}
          disabled={isFetching}
          size="sm"
          bg={buttonColors.primary.background}
          color={buttonColors.primary.text}
          borderRadius={materialDesign3Theme.borderRadius.sm}
          px={4}
          _hover={{
            bg: buttonColors.primary.hover,
          }}
          _disabled={{
            bg: buttonColors.primary.disabled,
            cursor: "not-allowed",
          }}
        >
          <Icon as={BiRefresh} mr={2} />
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </Flex>

      {/* Transaction Summary Cards - Only show when data available */}
      {!isLoading && !isError && data?.nodes && data.nodes.length > 0 && (
        <HStack gap={4} flexWrap="wrap">
          <SummaryBadge
            label="Deposits"
            count={data.nodes.filter((t) => t.action === "deposit").length}
            colorScheme="success"
          />
          <SummaryBadge
            label="Withdrawals"
            count={data.nodes.filter((t) => t.action === "withdraw").length}
            colorScheme="error"
          />
          <SummaryBadge
            label="Other"
            count={
              data.nodes.filter(
                (t) => t.action !== "deposit" && t.action !== "withdraw"
              ).length
            }
            colorScheme="neutral"
          />
        </HStack>
      )}

      {/* Transaction Table Card */}
      <Card.Root
        bg={cardColors.background}
        borderRadius={materialDesign3Theme.borderRadius.md}
        boxShadow={materialDesign3Theme.elevation.level1}
        border="1px solid"
        borderColor={cardColors.border}
        overflow="hidden"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          boxShadow: materialDesign3Theme.elevation.level2,
        }}
      >
        <Card.Body p={0}>
          <TransactionHistoryTable
            data={data?.nodes}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
          />
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

// Summary Badge Component
const SummaryBadge: React.FC<{
  label: string;
  count: number;
  colorScheme: "success" | "error" | "neutral";
}> = ({ label, count, colorScheme }) => {
  if (count === 0) return null;

  const colors = {
    success: { bg: "success.50", text: "success.700", border: "success.200" },
    error: { bg: "error.50", text: "error.700", border: "error.200" },
    neutral: { bg: "neutral.100", text: "neutral.700", border: "neutral.300" },
  };

  const scheme = colors[colorScheme];

  return (
    <Badge
      bg={scheme.bg}
      color={scheme.text}
      borderRadius={materialDesign3Theme.borderRadius.sm}
      px={3}
      py={1.5}
      fontSize="sm"
      fontWeight="medium"
      border="1px solid"
      borderColor={scheme.border}
    >
      {count} {label}
    </Badge>
  );
};
