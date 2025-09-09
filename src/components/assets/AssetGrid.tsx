import {
  SimpleGrid,
  VStack,
  Text,
  Box,
  HStack,
  Button,
  Tabs,
  Alert,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { Refresh } from "@mui/icons-material";
import { useState } from "react";
import { AssetCard } from "./AssetCard";
import { DepositModal } from "./DepositModal";
import { WithdrawModal } from "./WithdrawModal";
import { useAssets } from "@/hooks/useAssets";
import { type Asset, type VaultAsset } from "@/types/wallet";

interface AssetGridProps {
  showVaultAssets?: boolean;
  showActions?: boolean;
}

export const AssetGrid = ({
  showVaultAssets = true,
  showActions = true,
}: AssetGridProps) => {
  const { assets, vaultAssets, loading, error, refreshAssets, isConnected } = useAssets();
  const [selectedAsset, setSelectedAsset] = useState<Asset | VaultAsset | null>(null);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleDeposit = (asset: Asset | VaultAsset) => {
    setSelectedAsset(asset);
    setDepositModalOpen(true);
  };

  const handleWithdraw = (asset: VaultAsset) => {
    setSelectedAsset(asset);
    setWithdrawModalOpen(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAssets();
    } finally {
      setRefreshing(false);
    }
  };

  if (!isConnected) {
    return (
      <Alert.Root status="info">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Wallet Not Connected</Alert.Title>
          <Alert.Description>
            Please connect your wallet to view your assets.
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error Loading Assets</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  const renderAssetGrid = (assetList: (Asset | VaultAsset)[], emptyMessage: string) => {
    if (loading) {
      return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <AssetCard key={index} asset={{} as Asset} isLoading />
          ))}
        </SimpleGrid>
      );
    }

    if (assetList.length === 0) {
      return (
        <Box textAlign="center" py={8}>
          <Text color="fg.secondary">{emptyMessage}</Text>
        </Box>
      );
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
        {assetList.map((asset) => (
          <AssetCard
            key={asset.address}
            asset={asset}
            showActions={showActions}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
          />
        ))}
      </SimpleGrid>
    );
  };

  return (
    <VStack gap={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <Text fontSize="2xl" fontWeight="bold">
          Your Assets
        </Text>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          leftIcon={
            refreshing ? (
              <Spinner size="sm" />
            ) : (
              <Icon asChild>
                <Refresh />
              </Icon>
            )
          }
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </HStack>

      {/* Asset Tabs */}
      {showVaultAssets ? (
        <Tabs.Root defaultValue="wallet">
          <Tabs.List>
            <Tabs.Trigger value="wallet">
              Wallet Assets ({assets.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="vault">
              Vault Assets ({vaultAssets.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="wallet" pt={4}>
            {renderAssetGrid(assets, "No assets found in your wallet.")}
          </Tabs.Content>

          <Tabs.Content value="vault" pt={4}>
            {renderAssetGrid(vaultAssets, "No assets deposited in vault.")}
          </Tabs.Content>
        </Tabs.Root>
      ) : (
        renderAssetGrid(assets, "No assets found in your wallet.")
      )}

      {/* Modals */}
      {selectedAsset && (
        <>
          <DepositModal
            isOpen={depositModalOpen}
            onClose={() => {
              setDepositModalOpen(false);
              setSelectedAsset(null);
            }}
            asset={selectedAsset}
          />
          
          {withdrawModalOpen && 'depositedAmount' in selectedAsset && (
            <WithdrawModal
              isOpen={withdrawModalOpen}
              onClose={() => {
                setWithdrawModalOpen(false);
                setSelectedAsset(null);
              }}
              asset={selectedAsset as VaultAsset}
            />
          )}
        </>
      )}
    </VStack>
  );
};