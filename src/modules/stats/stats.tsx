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
  BiDollarCircle,
} from "react-icons/bi";
import { RiPercentLine } from "react-icons/ri";
import { useAuth } from "@/provider/auth-provider";
import { useThemeColors } from "@/provider/theme-provider";
import { useGetUserStatisticsQuery } from "@/hooks/common/use-stats";
import { useQueryClient } from "@tanstack/react-query";
import { walletAmountQueryKeys } from "@/hooks/use-get-wallet-amount";
import { maxQuoteQueryKeys } from "@/hooks/use-get-max-quote";

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
  return `${(value * 100).toFixed(2)}%`;
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
    key: "apy_avg",
    label: "Average APY",
    icon: RiPercentLine,
    formatter: formatPercentage,
    color: "tertiary.600",
    bgColor: "tertiary.50",
    borderColor: "tertiary.200",
  },
  {
    key: "referral_balance",
    label: "Referral Balance",
    icon: BiDollarCircle,
    formatter: formatCurrency,
    color: "black",
    bgColor: "gray.100",
    borderColor: "black",
  }
];

export default function Stats() {
  const { isAuthenticated, user } = useAuth();
  const { cardColors, colors, buttonColors, isDark } = useThemeColors();
  const queryClient = useQueryClient();
  const getUserStatsQuery = useGetUserStatisticsQuery(user?.address);
  const handleRefreshStats = async () => {
    getUserStatsQuery.refetch();

    // Also refetch wallet amount and max quote data
    if (user?.address) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: walletAmountQueryKeys.assets(user.address),
        }),
        queryClient.invalidateQueries({
          queryKey: maxQuoteQueryKeys.quote(user.address),
        }),
      ]);
    }
  };
  console.log(getUserStatsQuery.data)
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
              bg="rgba(255,184,0,0.1)"
              borderRadius="16px"
              border="1px solid rgba(255,184,0,0.2)"
              p={4}
            >
              <Alert.Description>
                <Text
                  color="#FFB800"
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
              bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
              backdropFilter={isDark ? 'blur(12px)' : 'none'}
              border="1px solid"
              borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
              borderRadius="16px"
            >
              <Spinner size="xl" color={isDark ? '#39FF14' : '#1FAE5C'} borderWidth="4px" />
              <Text
                mt={4}
                fontSize={materialDesign3Theme.typography.titleMedium.fontSize}
                fontWeight="medium"
                color={isDark ? '#8AAA8A' : '#666666'}
                letterSpacing={isDark ? '0.04em' : 'normal'}
              >
                Loading your statistics...
              </Text>
            </Box>
          )}

          {getUserStatsQuery.isError && (
            <Alert.Root
              status="error"
              bg="rgba(255,68,68,0.1)"
              borderRadius="16px"
              border="1px solid rgba(255,68,68,0.2)"
              p={4}
            >
              <Alert.Description>
                <VStack align="stretch" gap={2}>
                  <Text
                    color="#FF4444"
                    fontWeight="medium"
                    fontSize={materialDesign3Theme.typography.labelLarge.fontSize}
                  >
                    Failed to Load Statistics
                  </Text>
                  <Text
                    color="#FF4444"
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
                    bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
                    backdropFilter={isDark ? 'blur(12px)' : 'none'}
                    css={isDark ? { WebkitBackdropFilter: 'blur(12px)' } : {}}
                    border="1px solid"
                    borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
                    borderRadius="16px"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{
                      borderColor: isDark ? 'rgba(57,255,20,0.3)' : 'rgba(31,174,92,0.3)',
                      bg: isDark ? 'rgba(6, 30, 6, 0.85)' : '#FAFAFA',
                      boxShadow: isDark ? '0 0 20px rgba(57,255,20,0.08)' : 'none',
                    }}
                    overflow="hidden"
                    className={isDark ? 'cyber-corners' : undefined}
                  >
                    {/* Card Header with Icon and Label */}
                    <Box
                      bg={isDark ? 'rgba(57,255,20,0.02)' : '#F8F8F8'}
                      borderBottom="1px solid"
                      borderBottomColor={isDark ? 'rgba(57,255,20,0.06)' : '#F0F0F0'}
                      p={4}
                    >
                      <HStack gap={3}>
                        <Box
                          bg={stat.bgColor}
                          p={2}
                          borderRadius={materialDesign3Theme.borderRadius.xs}
                        >
                          <Icon
                            as={IconComponent}
                            color={stat.color}
                            fontSize="20px"
                          />
                        </Box>
                        <Text
                          fontSize="11px"
                          fontWeight="medium"
                          color={isDark ? '#8AAA8A' : '#666666'}
                          lineHeight="1.2"
                          letterSpacing={isDark ? '0.04em' : 'normal'}
                          textTransform={isDark ? 'uppercase' : 'none'}
                        >
                          {stat.label}
                        </Text>
                      </HStack>
                    </Box>

                    {/* Card Body with Value */}
                    <Card.Body p={6}>
                      <Text
                        fontSize="24px"
                        fontWeight="bold"
                        fontFamily="'JetBrains Mono', monospace"
                        color={isDark ? '#E8FFE8' : '#0A0A0A'}
                        lineHeight="1.1"
                        letterSpacing="-0.02em"
                        className={isDark ? 'mono-value' : undefined}
                      >
                        {formattedValue}
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
              bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
              backdropFilter={isDark ? 'blur(12px)' : 'none'}
              border="1px solid"
              borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
              borderRadius="16px"
            >
              <Text
                fontSize={materialDesign3Theme.typography.titleLarge.fontSize}
                fontWeight="medium"
                color={isDark ? '#D4E8D4' : '#1A1A1A'}
                mb={2}
              >
                No Statistics Available
              </Text>
              <Text
                color={isDark ? '#8AAA8A' : '#666666'}
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
