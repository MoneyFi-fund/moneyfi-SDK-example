import {
  Card,
  VStack,
  Text,
  Alert,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";
import { useGetUserAssetAllocation } from "@/hooks/common/use-asset-allocation";
import { useThemeColors } from "@/provider/theme-provider";
import { materialDesign3Theme } from "@/theme/material-design-3";
import { AllocationChartCard } from "./allocation-chart-card";
import type { AssetAllocationResponse } from "@/types/asset-allocation";
import { Token } from "@/utils/web3";

interface UserAssetAllocationProps {
  address?: string;
  isConnected: boolean;
}

// Chart colors — Web3 dark+green palette
const CHART_COLORS = [
  '#39FF14', '#1FAE5C', '#15803D', '#0F5C2E', '#052E16',
  '#5FFF42', '#2ECC11', '#166534', '#14532D', '#064E3B',
];

// Token address to symbol mapping
const TOKEN_ADDRESS_MAP: Record<string, string> = {
  [Token.USDC]: 'USDC',
  [Token.USDT]: 'USDT',
  [Token.USD1]: 'USD1',
};

// Data transformers
const truncateAddress = (addr: string) =>
  addr.length > 12 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;

const getTokenSymbol = (address: string): string =>
  TOKEN_ADDRESS_MAP[address] || truncateAddress(address);

const transformChainData = (data: AssetAllocationResponse['balance_by_chain']) =>
  data.map((item, idx) => ({
    name: item.chain.charAt(0).toUpperCase() + item.chain.slice(1),
    value: item.balance,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

const transformProtocolData = (data: AssetAllocationResponse['balance_by_protocol']) =>
  data.map((item, idx) => ({
    name: item.protocol.charAt(0).toUpperCase() + item.protocol.slice(1),
    value: item.balance,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

const transformTokenData = (data: AssetAllocationResponse['balance_by_token']) =>
  data.map((item, idx) => ({
    name: getTokenSymbol(item.token),
    value: item.balance,
    color: CHART_COLORS[idx % CHART_COLORS.length],
  }));

export default function UserAssetAllocationComponent({
  address,
  isConnected,
}: UserAssetAllocationProps) {
  const { cardColors, isDark } = useThemeColors();
  const allocationQuery = useGetUserAssetAllocation(address || "");

  // Not connected state
  if (!isConnected) {
    return (
      <Card.Root
        bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(12px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        border="1px solid"
        borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
        borderRadius="16px"
      >
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold" color={cardColors.text}>
            Asset Allocation
          </Text>
        </Card.Header>
        <Card.Body>
          <Alert.Root status="warning">
            <Alert.Description>
              Connect your wallet to view asset allocation.
            </Alert.Description>
          </Alert.Root>
        </Card.Body>
      </Card.Root>
    );
  }

  // Loading state
  if (allocationQuery.isPending) {
    return (
      <Card.Root
        bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(12px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        border="1px solid"
        borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
        borderRadius="16px"
      >
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold" color={cardColors.text}>
            Asset Allocation
          </Text>
        </Card.Header>
        <Card.Body>
          <VStack py={8}>
            <Spinner size="xl" color={isDark ? '#39FF14' : '#1FAE5C'} />
            <Text color={cardColors.textSecondary}>
              Loading asset allocation...
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  // Error state
  if (allocationQuery.isError) {
    return (
      <Card.Root
        bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(12px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        border="1px solid"
        borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
        borderRadius="16px"
      >
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold" color={cardColors.text}>
            Asset Allocation
          </Text>
        </Card.Header>
        <Card.Body>
          <Alert.Root status="error">
            <Alert.Description>
              <VStack align="start" gap={1}>
                <Text fontWeight="medium">Failed to load allocation</Text>
                <Text fontSize="sm">
                  {allocationQuery.error instanceof Error
                    ? allocationQuery.error.message
                    : "Unknown error occurred"}
                </Text>
              </VStack>
            </Alert.Description>
          </Alert.Root>
        </Card.Body>
      </Card.Root>
    );
  }

  // Success state - Three chart cards
  const allocation = allocationQuery.data as AssetAllocationResponse | null;

  if (!allocation) {
    return (
      <Card.Root
        bg={isDark ? 'rgba(6, 20, 6, 0.75)' : '#FFFFFF'}
        backdropFilter={isDark ? 'blur(12px)' : 'none'}
        css={isDark ? { WebkitBackdropFilter: 'blur(10px)' } : {}}
        border="1px solid"
        borderColor={isDark ? 'rgba(57,255,20,0.1)' : '#E0E0E0'}
        borderRadius="16px"
      >
        <Card.Header>
          <Text fontSize="lg" fontWeight="semibold" color={cardColors.text}>
            Asset Allocation
          </Text>
        </Card.Header>
        <Card.Body>
          <Text color={cardColors.textSecondary}>
            No allocation data available
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  const chainData = transformChainData(allocation.balance_by_chain || []);
  const protocolData = transformProtocolData(allocation.balance_by_protocol || []);
  const tokenData = transformTokenData(allocation.balance_by_token || []);

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
      <AllocationChartCard
        title="Cross-Chain Exposure"
        data={chainData}
        totalLabel="Total"
        countLabel="Networks"
        emptyMessage="No chain data"
      />
      <AllocationChartCard
        title="DeFi Protocol Spread"
        data={protocolData}
        totalLabel="Total"
        countLabel="Protocols"
        emptyMessage="No protocol data"
      />
      <AllocationChartCard
        title="Asset Allocation Map"
        data={tokenData}
        totalLabel="Total"
        countLabel="Stablecoins"
        emptyMessage="No token data"
      />
    </SimpleGrid>
  );
}
