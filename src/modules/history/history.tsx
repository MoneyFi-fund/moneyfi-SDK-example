import React, { useState } from "react";
import {
  Card,
  VStack,
  Text,
  Box,
  Container,
  HStack,
  Button,
  Icon,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { BiRefresh, BiWallet, BiHistory, BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { useThemeColors } from "@/provider/theme-provider";
import { useAuth } from "@/provider/auth-provider";
import { useTransactionHistoryQuery } from "@/hooks/common/use-transaction-history";
import { TransactionHistoryTable } from "./components/transaction-table";

export const HistoryPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { cardColors, colors, buttonColors, isDark } = useThemeColors();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError, refetch, isFetching } =
    useTransactionHistoryQuery(currentPage, limit);

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
                  bg={isDark ? 'rgba(57,255,20,0.1)' : 'rgba(31,174,92,0.08)'}
                  p={2}
                  borderRadius={materialDesign3Theme.borderRadius.sm}
                >
                  <Icon as={BiHistory} color={isDark ? '#39FF14' : '#1FAE5C'} boxSize={6} />
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
              bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
              backdropFilter={isDark ? 'blur(10px)' : 'none'}
              css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
              borderRadius="16px"
              border="1px solid"
              borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
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
                  bg={isDark ? 'rgba(255,184,0,0.1)' : 'rgba(255,184,0,0.08)'}
                  p={4}
                  borderRadius="full"
                  mb={4}
                >
                  <Icon as={BiWallet} color="#FFB800" boxSize={10} />
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

  // Use totalCount from API (e.g., 29), fallback to nodes.length
  const totalCount = data?.totalCount ?? data?.nodes?.length ?? 0;
  const totalPages = Math.ceil(totalCount / limit);
  const startItem = totalCount > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = Math.min(currentPage * limit, totalCount);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

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
            bg={isDark ? 'rgba(57,255,20,0.1)' : 'rgba(31,174,92,0.08)'}
            p={2}
            borderRadius={materialDesign3Theme.borderRadius.sm}
            display={{ base: "none", sm: "flex" }}
          >
            <Icon as={BiHistory} color={isDark ? '#39FF14' : '#1FAE5C'} boxSize={6} />
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
            {!isLoading && totalCount > 0 && (
              <Text
                fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                color={cardColors.textSecondary}
              >
                {totalCount} transaction{totalCount !== 1 ? "s" : ""} found
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
      {/* {!isLoading && !isError && data?.nodes && data.nodes.length > 0 && (
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
      )} */}

      {/* Pagination Controls - Top position */}
      {!isLoading && !isError && totalCount > limit && (
        <Flex
          justify="space-between"
          align="center"
          p={4}
          bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
          backdropFilter={isDark ? 'blur(10px)' : 'none'}
          css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
          borderRadius="16px"
          border="1px solid"
          borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
        >
          {/* Page Info */}
          <Text fontSize="sm" color={cardColors.textSecondary}>
            Showing {startItem}-{endItem} of {totalCount}
          </Text>

          {/* Page Controls */}
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1 || isFetching}
              borderRadius={materialDesign3Theme.borderRadius.xs}
              borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
              color={isDark ? '#E0E0E0' : '#1A1A1A'}
              _hover={{
                borderColor: isDark ? '#39FF14' : '#1FAE5C',
                color: isDark ? '#39FF14' : '#1FAE5C',
              }}
            >
              <Icon as={BiChevronLeft} />
              Prev
            </Button>

            <Text fontSize="sm" fontWeight="medium" px={3} color={isDark ? '#E0E0E0' : '#1A1A1A'}>
              Page {currentPage} of {totalPages}
            </Text>

            <Button
              size="sm"
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isFetching}
              borderRadius={materialDesign3Theme.borderRadius.xs}
              borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
              color={isDark ? '#E0E0E0' : '#1A1A1A'}
              _hover={{
                borderColor: isDark ? '#39FF14' : '#1FAE5C',
                color: isDark ? '#39FF14' : '#1FAE5C',
              }}
            >
              Next
              <Icon as={BiChevronRight} />
            </Button>
          </HStack>
        </Flex>
      )}

      {/* Transaction Table Card */}
      <Card.Root
        bg={isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(10px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        borderRadius="16px"
        border="1px solid"
        borderColor={isDark ? 'rgba(255,255,255,0.15)' : '#E0E0E0'}
        overflow="hidden"
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
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
