import {
  Dialog,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  Box,
  Field,
  NumberInput,
  Alert,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { type VaultAsset } from "@/types/wallet";
import { useVaultOperations } from "@/hooks/useContract";
import { useAssets } from "@/hooks/useAssets";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: VaultAsset;
}

export const WithdrawModal = ({ isOpen, onClose, asset }: WithdrawModalProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { withdrawFromVault, loading } = useVaultOperations();
  const { refreshAssets } = useAssets();

  const maxWithdraw = parseFloat(asset.currentAmount) / Math.pow(10, asset.decimals);
  const deposited = parseFloat(asset.depositedAmount) / Math.pow(10, asset.decimals);

  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setError(null);
    }
  }, [isOpen]);

  const validateAmount = (value: string): string | null => {
    if (!value || parseFloat(value) <= 0) {
      return "Please enter a valid amount";
    }
    
    if (parseFloat(value) > maxWithdraw) {
      return "Amount exceeds available vault balance";
    }

    return null;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(validateAmount(value));
  };

  const handleMaxClick = () => {
    setAmount(maxWithdraw.toString());
    setError(null);
  };

  const handleWithdraw = async () => {
    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const amountInBaseUnits = Math.floor(parseFloat(amount) * Math.pow(10, asset.decimals)).toString();
      await withdrawFromVault(amountInBaseUnits, asset.address);
      
      // Refresh assets after successful withdrawal
      await refreshAssets();
      
      onClose();
    } catch (error: any) {
      setError(error.message || "Withdrawal failed");
    }
  };

  const isFormValid = amount && !error && parseFloat(amount) > 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Content maxW="md">
        <Dialog.Header>
          <Dialog.Title>Withdraw from Vault</Dialog.Title>
        </Dialog.Header>

        <Dialog.Body>
          <VStack gap={6} align="stretch">
            {/* Asset Info */}
            <HStack gap={3} p={4} bg="bg.secondary" borderRadius="md">
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

            {/* Vault Balance Info */}
            <VStack gap={3} p={4} bg="bg.tertiary" borderRadius="md">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="fg.secondary">Originally Deposited:</Text>
                <Text fontWeight="medium">
                  {deposited.toLocaleString(undefined, {
                    maximumFractionDigits: asset.decimals > 6 ? 6 : asset.decimals,
                  })} {asset.symbol}
                </Text>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="fg.secondary">Current Balance:</Text>
                <Text fontWeight="medium" color="green.600">
                  {maxWithdraw.toLocaleString(undefined, {
                    maximumFractionDigits: asset.decimals > 6 ? 6 : asset.decimals,
                  })} {asset.symbol}
                </Text>
              </HStack>
              
              {maxWithdraw > deposited && (
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="fg.secondary">Earnings:</Text>
                  <Text fontWeight="medium" color="green.600">
                    +{(maxWithdraw - deposited).toLocaleString(undefined, {
                      maximumFractionDigits: asset.decimals > 6 ? 6 : asset.decimals,
                    })} {asset.symbol}
                  </Text>
                </HStack>
              )}
            </VStack>

            {/* Amount Input */}
            <Field.Root invalid={!!error}>
              <Field.Label>Amount to Withdraw</Field.Label>
              <VStack gap={2} align="stretch">
                <HStack>
                  <NumberInput.Root
                    value={amount}
                    onValueChange={(details) => handleAmountChange(details.value)}
                    min={0}
                    max={maxWithdraw}
                    flex={1}
                  >
                    <NumberInput.Field placeholder="0.00" />
                  </NumberInput.Root>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMaxClick}
                    disabled={maxWithdraw === 0}
                  >
                    MAX
                  </Button>
                </HStack>
                
                <HStack justify="space-between" fontSize="sm" color="fg.secondary">
                  <Text>Available to Withdraw:</Text>
                  <Text>
                    {maxWithdraw.toLocaleString(undefined, {
                      maximumFractionDigits: asset.decimals > 6 ? 6 : asset.decimals,
                    })} {asset.symbol}
                  </Text>
                </HStack>
              </VStack>
              
              {error && <Field.ErrorText>{error}</Field.ErrorText>}
            </Field.Root>

            {/* Transaction Preview */}
            {amount && parseFloat(amount) > 0 && !error && (
              <Box p={4} bg="bg.tertiary" borderRadius="md">
                <VStack gap={3} align="stretch">
                  <Text fontWeight="medium" fontSize="sm">
                    Transaction Preview
                  </Text>
                  
                  <VStack gap={2} align="stretch" fontSize="sm">
                    <HStack justify="space-between">
                      <Text color="fg.secondary">Withdraw Amount:</Text>
                      <Text fontWeight="medium">
                        {parseFloat(amount).toLocaleString()} {asset.symbol}
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text color="fg.secondary">Remaining in Vault:</Text>
                      <Text fontWeight="medium">
                        {(maxWithdraw - parseFloat(amount)).toLocaleString()} {asset.symbol}
                      </Text>
                    </HStack>
                    
                    {asset.usdValue && (
                      <HStack justify="space-between">
                        <Text color="fg.secondary">USD Value:</Text>
                        <Text fontWeight="medium" color="green.600">
                          ${(parseFloat(amount) * asset.usdValue).toFixed(2)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </Box>
            )}

            {/* Warning */}
            <Alert.Root status="info" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description fontSize="sm">
                  Withdrawals from the vault may take a few moments to process and appear in your wallet balance.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </VStack>
        </Dialog.Body>

        <Dialog.Footer>
          <HStack gap={3} w="full">
            <Button variant="outline" onClick={onClose} flex={1}>
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={!isFormValid || loading}
              loading={loading}
              flex={1}
            >
              {loading ? "Withdrawing..." : "Withdraw"}
            </Button>
          </HStack>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};