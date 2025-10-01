import {
  Box,
  Container,
  VStack,
  Text,
  Button,
  Alert,
  SimpleGrid,
  Card,
  Spinner,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { materialDesign3Theme } from "@/theme/material-design-3";
import {
  BiRefresh,
  BiTrendingUp,
  BiDollar,
  BiWallet,
  BiAward,
  BiDownArrowCircle,
  BiUpArrowCircle,
  BiTargetLock,
} from "react-icons/bi";
import { RiPercentLine } from "react-icons/ri";
import { useAuth } from "@/provider/auth-provider";
import { useThemeColors } from "@/provider/theme-provider";
import { useGetUserStatisticsQuery } from "@/hooks/use-stats";

// Utility function to format currency values
const formatCurrency = (value: number): string => {
  if (value === 0) return "$0.00";
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

// Utility function to format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Define statistics configuration with labels, icons, and formatting
const statsConfig = [
  {
    key: "total_value",
    label: "Total Portfolio Value",
    icon: BiDollar,
    formatter: formatCurrency,
    color: "success.600",
    bgColor: "success.50",
    borderColor: "success.200",
  },
  {
    key: "idle_asset_value",
    label: "Idle Assets",
    icon: BiWallet,
    formatter: formatCurrency,
    color: "neutral.600",
    bgColor: "neutral.50",
    borderColor: "neutral.200",
  },
  {
    key: "total_deposited_liquidity",
    label: "Total Deposited",
    icon: BiDownArrowCircle,
    formatter: formatCurrency,
    color: "primary.600",
    bgColor: "primary.50",
    borderColor: "primary.200",
  },
  {
    key: "cumulative_yield_profits",
    label: "Cumulative Profits",
    icon: BiTrendingUp,
    formatter: formatCurrency,
    color: "success.700",
    bgColor: "success.50",
    borderColor: "success.200",
  },
  {
    key: "total_monetized_balance",
    label: "Monetized Balance",
    icon: BiTargetLock,
    formatter: formatCurrency,
    color: "secondary.600",
    bgColor: "secondary.50",
    borderColor: "secondary.200",
  },
  {
    key: "pending_yield_earnings",
    label: "Pending Earnings",
    icon: BiAward,
    formatter: formatCurrency,
    color: "warning.600",
    bgColor: "warning.50",
    borderColor: "warning.200",
  },
  {
    key: "total_withdrawn_liquidity",
    label: "Total Withdrawn",
    icon: BiUpArrowCircle,
    formatter: formatCurrency,
    color: "error.600",
    bgColor: "error.50",
    borderColor: "error.200",
  },
  {
    key: "apr_avg",
    label: "Average APR",
    icon: RiPercentLine,
    formatter: formatPercentage,
    color: "tertiary.600",
    bgColor: "tertiary.50",
    borderColor: "tertiary.200",
  },
];

export default function Stats() {
  const { isAuthenticated, user } = useAuth();
  const { cardColors, colors, buttonColors } = useThemeColors();
  const getUserStatsQuery = useGetUserStatisticsQuery(user?.address);

  const handleRefreshStats = () => {
    getUserStatsQuery.refetch();
  };

  if (!isAuthenticated) {
    return (
      <Box minH="60vh" bg={colors.background}>
        <Container maxW="full" p={8}>
          <VStack align="stretch" gap={6}>
            <Text
              fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
              fontWeight="medium"
              color={colors.onBackground}
            >
              Statistics
            </Text>
            <Alert.Root
              status="warning"
              bg="warning.50"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              border="1px solid"
              borderColor="warning.200"
              p={4}
            >
              <Alert.Description>
                <Text
                  color="warning.800"
                  fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                >
                  Please connect your wallet to view your statistics.
                </Text>
              </Alert.Description>
            </Alert.Root>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="60vh" bg={colors.background}>
      <Container maxW="full" p={6}>
        <VStack align="stretch" gap={6}>
          {/* Refresh Button */}
          <Button
            onClick={handleRefreshStats}
            loading={getUserStatsQuery.isFetching}
            disabled={getUserStatsQuery.isFetching}
            bg={buttonColors.primary.background}
            color={buttonColors.primary.text}
            minH="48px"
            px={6}
            borderRadius="sm"
            boxShadow="sm"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            fontWeight="medium"
            fontSize="label-lg"
            display="flex"
            justifyItems="end"
            width="200px"
            _hover={{
              bg: buttonColors.primary.hover,
              boxShadow: "md",
            }}
            _active={{
              bg: buttonColors.primary.active,
              boxShadow: "sm",
            }}
            _loading={{
              bg: buttonColors.primary.disabled,
            }}
            _disabled={{
              bg: buttonColors.primary.disabled,
              color: colors.onSurfaceVariant,
              cursor: "not-allowed",
              boxShadow: "none",
            }}
          >
            <Icon as={BiRefresh} />
            {getUserStatsQuery.isFetching
              ? "Refreshing..."
              : "Refresh Statistics"}
          </Button>

          {getUserStatsQuery.isPending && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={8}
              bg={cardColors.background}
              border="1px solid"
              borderColor={cardColors.border}
              borderRadius={materialDesign3Theme.borderRadius.md}
            >
              <Spinner size="xl" color="primary.500" borderWidth="4px" />
              <Text
                mt={4}
                fontSize={materialDesign3Theme.typography.titleMedium.fontSize}
                fontWeight="medium"
                color={cardColors.textSecondary}
              >
                Loading your statistics...
              </Text>
            </Box>
          )}

          {getUserStatsQuery.isError && (
            <Alert.Root
              status="error"
              bg="error.50"
              borderRadius={materialDesign3Theme.borderRadius.sm}
              border="1px solid"
              borderColor="error.200"
              p={4}
            >
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text
                    color="error.800"
                    fontWeight="medium"
                    fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                  >
                    Failed to Load Statistics
                  </Text>
                  <Text
                    color="error.700"
                    fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
                  >
                    {getUserStatsQuery.error instanceof Error
                      ? getUserStatsQuery.error.message
                      : "Unable to fetch your statistics. Please try again."}
                  </Text>
                </VStack>
              </Alert.Description>
            </Alert.Root>
          )}

          {/* Statistics Grid */}
          {getUserStatsQuery.isSuccess && getUserStatsQuery.data && (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={4}>
              {statsConfig.map((stat) => {
                const IconComponent = stat.icon;
                const value =
                  getUserStatsQuery.data[
                    stat.key as keyof typeof getUserStatsQuery.data
                  ] || 0;
                const formattedValue = stat.formatter(Number(value));

                return (
                  <Card.Root
                    key={stat.key}
                    bg="surface.50"
                    border="1px solid"
                    borderColor={stat.borderColor}
                    borderRadius={materialDesign3Theme.borderRadius.md}
                    boxShadow={materialDesign3Theme.elevation.level1}
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      boxShadow: materialDesign3Theme.elevation.level2,
                    }}
                    overflow="hidden"
                  >
                    {/* Card Header with Icon and Color */}
                    <Box
                      bg={stat.bgColor}
                      borderBottom="1px solid"
                      borderBottomColor={stat.borderColor}
                      p={4}
                    >
                      <HStack gap={3}>
                        <Box
                          bg={stat.color}
                          p={2}
                          borderRadius={materialDesign3Theme.borderRadius.xs}
                        >
                          <Icon
                            as={IconComponent}
                            color="white"
                            fontSize="20px"
                          />
                        </Box>
                        <Text
                          fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                          fontWeight="medium"
                          color="neutral.700"
                          lineHeight="1.2"
                        >
                          {stat.label}
                        </Text>
                      </HStack>
                    </Box>

                    {/* Card Body with Value */}
                    <Card.Body p={6}>
                      <Text
                        fontSize={materialDesign3Theme.typography.headlineMedium.fontSize}
                        fontWeight="bold"
                        color={stat.color}
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                      >
                        {formattedValue}
                      </Text>

                      {/* Value Change Indicator (placeholder for future enhancement) */}
                      <Text
                        fontSize={materialDesign3Theme.typography.bodySmall.fontSize}
                        color="neutral.500"
                        mt={2}
                      >
                        Current value
                      </Text>
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </SimpleGrid>
          )}

          {/* Empty State */}
          {getUserStatsQuery.isSuccess && !getUserStatsQuery.data && (
            <Box
              textAlign="center"
              p={12}
              bg="surface.50"
              border="1px solid"
              borderColor="neutral.200"
              borderRadius={materialDesign3Theme.borderRadius.md}
            >
              <Text
                fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
                fontWeight="medium"
                color="neutral.700"
                mb={2}
              >
                No Statistics Available
              </Text>
              <Text
                color="neutral.600"
                fontSize={materialDesign3Theme.typography.bodyMedium.fontSize}
              >
                Click "Refresh Statistics" to load your statistics.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
