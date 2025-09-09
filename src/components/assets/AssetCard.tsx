import {
  Card,
  VStack,
  HStack,
  Text,
  Image,
  Box,
  Badge,
  Button,
  Skeleton,
  Icon,
} from "@chakra-ui/react";
import { OpenInNew } from "@mui/icons-material";
import { type Asset, type VaultAsset } from "@/types/wallet";

interface AssetCardProps {
  asset: Asset | VaultAsset;
  isLoading?: boolean;
  showActions?: boolean;
  onDeposit?: (asset: Asset | VaultAsset) => void;
  onWithdraw?: (asset: VaultAsset) => void;
}

export const AssetCard = ({
  asset,
  isLoading = false,
  showActions = true,
  onDeposit,
  onWithdraw,
}: AssetCardProps) => {
  const isVaultAsset = "depositedAmount" in asset;

  const formatBalance = (balance: string, decimals: number) => {
    const balanceNumber = parseFloat(balance) / Math.pow(10, decimals);
    return balanceNumber.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals > 6 ? 6 : decimals,
    });
  };

  const formatUsdValue = (usdValue?: number) => {
    if (!usdValue || usdValue === 0) return null;
    return usdValue.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (isLoading) {
    return (
      <Card.Root>
        <Card.Body p={4}>
          <VStack gap={3} align="stretch">
            <HStack justify="space-between">
              <HStack gap={3}>
                <Skeleton boxSize={10} borderRadius="full" />
                <VStack align="start" gap={1}>
                  <Skeleton h={5} w={20} />
                  <Skeleton h={4} w={16} />
                </VStack>
              </HStack>
              <Skeleton h={6} w={12} />
            </HStack>
            <VStack gap={2} align="stretch">
              <Skeleton h={4} w="full" />
              <Skeleton h={4} w="60%" />
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root _hover={{ shadow: "md" }} transition="all 0.2s">
      <Card.Body p={4}>
        <VStack gap={3} align="stretch">
          {/* Header */}
          <HStack justify="space-between">
            <HStack gap={3}>
              {asset.logoUrl ? (
                <Image
                  src={asset.logoUrl}
                  alt={asset.symbol}
                  boxSize={10}
                  borderRadius="full"
                  fallback={
                    <Box
                      boxSize={10}
                      bg="gray.200"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="sm" fontWeight="bold">
                        {asset.symbol.charAt(0)}
                      </Text>
                    </Box>
                  }
                />
              ) : (
                <Box
                  boxSize={10}
                  bg="gray.200"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="sm" fontWeight="bold">
                    {asset.symbol.charAt(0)}
                  </Text>
                </Box>
              )}

              <VStack align="start" gap={0}>
                <Text fontWeight="semibold" fontSize="lg">
                  {asset.symbol}
                </Text>
                <Text fontSize="sm" color="fg.secondary">
                  {asset.name}
                </Text>
              </VStack>
            </HStack>

            {isVaultAsset && (
              <Badge colorScheme="blue" variant="subtle">
                Vault
              </Badge>
            )}
          </HStack>

          {/* Balance Information */}
          <VStack gap={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm" color="fg.secondary">
                {isVaultAsset ? "Current Amount" : "Balance"}
              </Text>
              <Text fontWeight="medium">
                {formatBalance(
                  isVaultAsset
                    ? (asset as VaultAsset).currentAmount
                    : asset.balance,
                  asset.decimals
                )}{" "}
                {asset.symbol}
              </Text>
            </HStack>

            {asset.usdValue && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="fg.secondary">
                  USD Value
                </Text>
                <Text fontWeight="medium" color="green.600">
                  {formatUsdValue(asset.usdValue)}
                </Text>
              </HStack>
            )}

            {isVaultAsset && (
              <HStack justify="space-between">
                <Text fontSize="sm" color="fg.secondary">
                  Deposited
                </Text>
                <Text fontWeight="medium">
                  {formatBalance(
                    (asset as VaultAsset).depositedAmount,
                    asset.decimals
                  )}{" "}
                  {asset.symbol}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Actions */}
          {showActions && (
            <VStack gap={2} align="stretch">
              {onDeposit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeposit(asset)}
                  disabled={parseFloat(asset.balance) === 0}
                >
                  Deposit to Vault
                </Button>
              )}

              {isVaultAsset && onWithdraw && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onWithdraw(asset as VaultAsset)}
                  disabled={
                    parseFloat((asset as VaultAsset).currentAmount) === 0
                  }
                >
                  Withdraw from Vault
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                rightIcon={
                  <Icon asChild>
                    <OpenInNew />
                  </Icon>
                }
                onClick={() => {
                  const explorerUrl = `https://explorer.aptoslabs.com/account/${asset.address}`;
                  window.open(explorerUrl, "_blank", "noopener,noreferrer");
                }}
              >
                View on Explorer
              </Button>
            </VStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
