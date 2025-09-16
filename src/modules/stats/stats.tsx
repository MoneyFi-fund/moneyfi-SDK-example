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
    color: "green.500",
    bgGradient: "linear(to-br, green.50, green.100)",
  },
  {
    key: "idle_asset_value",
    label: "Idle Assets",
    icon: BiWallet,
    formatter: formatCurrency,
    color: "gray.500",
    bgGradient: "linear(to-br, gray.50, gray.100)",
  },
  {
    key: "total_deposited_liquidity",
    label: "Total Deposited",
    icon: BiDownArrowCircle,
    formatter: formatCurrency,
    color: "blue.500",
    bgGradient: "linear(to-br, blue.50, blue.100)",
  },
  {
    key: "cumulative_yield_profits",
    label: "Cumulative Profits",
    icon: BiTrendingUp,
    formatter: formatCurrency,
    color: "green.600",
    bgGradient: "linear(to-br, green.50, green.100)",
  },
  {
    key: "total_monetized_balance",
    label: "Monetized Balance",
    icon: BiTargetLock,
    formatter: formatCurrency,
    color: "purple.500",
    bgGradient: "linear(to-br, purple.50, purple.100)",
  },
  {
    key: "pending_yield_earnings",
    label: "Pending Earnings",
    icon: BiAward,
    formatter: formatCurrency,
    color: "orange.500",
    bgGradient: "linear(to-br, orange.50, orange.100)",
  },
  {
    key: "total_withdrawn_liquidity",
    label: "Total Withdrawn",
    icon: BiUpArrowCircle,
    formatter: formatCurrency,
    color: "red.500",
    bgGradient: "linear(to-br, red.50, red.100)",
  },
  {
    key: "apr_avg",
    label: "Average APR",
    icon: RiPercentLine,
    formatter: formatPercentage,
    color: "teal.500",
    bgGradient: "linear(to-br, teal.50, teal.100)",
  },
];

export default function Stats() {
  const { isAuthenticated, user } = useAuth();
  const getUserStatsQuery = useGetUserStatisticsQuery(user?.address);

  const handleRefreshStats = () => {
    getUserStatsQuery.refetch();
  };

  if (!isAuthenticated) {
    return (
      <Box>
        <Container maxW="full" p={8}>
          <VStack align="stretch" gap={6}>
            <Text fontSize="2xl" fontWeight="semibold">
              Statistics
            </Text>
            <Alert.Root status="warning">
              <Alert.Description>
                Please connect your wallet to view your statistics.
              </Alert.Description>
            </Alert.Root>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Container maxW="full" p={6}>
        <VStack align="stretch" gap={6}>
          {/* Refresh Button */}
          <Button
            onClick={handleRefreshStats}
            loading={getUserStatsQuery.isFetching}
            disabled={getUserStatsQuery.isFetching}
            bg="blue.500"
            color="white"
            size="md"
            border="3px solid black"
            borderRadius="0"
            boxShadow="5px 5px 0px black"
            transition="all 0.2s ease"
            fontWeight="bold"
            display="flex"
            justifyItems="end"
            width="200px"
            _hover={{
              bg: "blue.400",
              transform: "translate(-2px, -2px)",
              boxShadow: "7px 7px 0px black",
            }}
            _active={{
              transform: "translate(2px, 2px)",
              boxShadow: "3px 3px 0px black",
            }}
            _loading={{
              bg: "blue.400",
              transform: "none",
              boxShadow: "5px 5px 0px black",
            }}
            _disabled={{
              bg: "gray.400",
              color: "gray.200",
              cursor: "not-allowed",
              transform: "none",
              boxShadow: "5px 5px 0px gray.600",
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
              p={6}
              bg="gray.50"
              border="3px solid black"
              borderRadius="0"
            >
              <Spinner size="xl" color="blue.500" borderWidth="4px" />
              <Text mt={4} fontSize="lg" fontWeight="bold" color="gray.700">
                Loading your statistics...
              </Text>
            </Box>
          )}

          {getUserStatsQuery.isError && (
            <Alert.Root status="error">
              <Alert.Description>
                <Box
                  bg="red.50"
                  border="3px solid red.500"
                  borderRadius="0"
                  p={6}
                  boxShadow="4px 4px 0px red.200"
                >
                  <Text color="red.700" fontWeight="bold" fontSize="lg">
                    Failed to Load Statistics
                  </Text>
                  <Text color="red.600" mt={2}>
                    {getUserStatsQuery.error instanceof Error
                      ? getUserStatsQuery.error.message
                      : "Unable to fetch your statistics. Please try again."}
                  </Text>
                </Box>
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
                    bg="white"
                    border="3px solid black"
                    borderRadius="0"
                    boxShadow="5px 5px 0px black"
                    transition="all 0.2s ease"
                    _hover={{
                      transform: "translate(-2px, -2px)",
                      boxShadow: "7px 7px 0px black",
                    }}
                    overflow="hidden"
                  >
                    {/* Card Header with Icon and Color */}
                    <Box
                      bg={stat.bgGradient}
                      borderBottom="3px solid black"
                      p={4}
                    >
                      <HStack spaceX={3}>
                        <Box
                          bg={stat.color}
                          p={2}
                          border="2px solid black"
                          borderRadius="0"
                        >
                          <Icon
                            as={IconComponent}
                            color="white"
                            fontSize="20px"
                          />
                        </Box>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="gray.700"
                          lineHeight="1.2"
                        >
                          {stat.label}
                        </Text>
                      </HStack>
                    </Box>

                    {/* Card Body with Value */}
                    <Card.Body p={6}>
                      <Text
                        fontSize="2xl"
                        fontWeight="black"
                        color={stat.color}
                        lineHeight="1"
                        letterSpacing="-0.02em"
                      >
                        {formattedValue}
                      </Text>

                      {/* Value Change Indicator (placeholder for future enhancement) */}
                      <Text fontSize="xs" color="gray.500" mt={2}>
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
              bg="gray.50"
              border="3px solid black"
              borderRadius="0"
            >
              <Text fontSize="xl" fontWeight="bold" color="gray.700" mb={2}>
                No Statistics Available
              </Text>
              <Text color="gray.600">
                Click "Refresh Statistics" to load your statistics.
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
