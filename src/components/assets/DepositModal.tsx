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
import { type Asset, type VaultAsset } from "@/types/wallet";
import { useVaultOperations } from "@/hooks/useContract";
import { useAssets } from "@/hooks/useAssets";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | VaultAsset;
}

export const DepositModal = ({ isOpen, onClose, asset }: DepositModalProps) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { depositToVault, loading } = useVaultOperations();
  const { getAssetBalance, refreshAssets } = useAssets();

  const balance = getAssetBalance(asset.address);
  const maxBalance = parseFloat(balance) / Math.pow(10, asset.decimals);

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
    
    if (parseFloat(value) > maxBalance) {
      return "Amount exceeds available balance";
    }

    return null;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(validateAmount(value));
  };

  const handleMaxClick = () => {
    setAmount(maxBalance.toString());
    setError(null);
  };

  const handleDeposit = async () => {
    const validationError = validateAmount(amount);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const amountInBaseUnits = Math.floor(parseFloat(amount) * Math.pow(10, asset.decimals)).toString();
      await depositToVault(amountInBaseUnits, asset.address);
      
      // Refresh assets after successful deposit
      await refreshAssets();
      
      onClose();
    } catch (error: any) {
      setError(error.message || "Deposit failed");
    }
  };

  const isFormValid = amount && !error && parseFloat(amount) > 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Dialog.Backdrop />
      <Dialog.Content maxW="md">
        <Dialog.Header>
          <Dialog.Title>Deposit to Vault</Dialog.Title>
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

            {/* Amount Input */}
            <Field.Root invalid={!!error}>
              <Field.Label>Amount to Deposit</Field.Label>
              <VStack gap={2} align="stretch">
                <HStack>
                  <NumberInput.Root
                    value={amount}
                    onValueChange={(details) => handleAmountChange(details.value)}
                    min={0}
                    max={maxBalance}
                    flex={1}
                  >
                    <NumberInput.Field placeholder="0.00" />
                  </NumberInput.Root>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMaxClick}
                    disabled={maxBalance === 0}
                  >
                    MAX
                  </Button>
                </HStack>
                
                <HStack justify="space-between" fontSize="sm" color="fg.secondary">
                  <Text>Available Balance:</Text>
                  <Text>
                    {maxBalance.toLocaleString(undefined, {
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
                      <Text color="fg.secondary">Deposit Amount:</Text>
                      <Text fontWeight="medium">
                        {parseFloat(amount).toLocaleString()} {asset.symbol}
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
            <Alert.Root status="warning" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description fontSize="sm">
                  Deposits to the vault may take a few moments to process and appear in your vault balance.
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
              onClick={handleDeposit}
              disabled={!isFormValid || loading}
              loading={loading}
              flex={1}
            >
              {loading ? "Depositing..." : "Deposit"}
            </Button>
          </HStack>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
};