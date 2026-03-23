import React from 'react';
import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import type { UseFormRegister, UseFormSetValue, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { useThemeColors } from '@/provider/theme-provider';

interface AmountInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  balance?: number;
  decimals?: number;
  currency?: string;
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  errors: FieldErrors<T>;
  showMaxButton?: boolean;
}

export function AmountInput<T extends FieldValues>({
  name,
  label,
  balance,
  decimals = 6,
  currency = 'USDC',
  required = false,
  disabled = false,
  register,
  setValue,
  errors,
  showMaxButton = true,
}: AmountInputProps<T>) {
  const { isDark } = useThemeColors();
  const error = errors[name];

  const handleMaxClick = () => {
    if (balance !== undefined) {
      setValue(name, balance.toFixed(decimals) as any, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <VStack align="stretch" gap={1}>
      <Field.Root required={required} disabled={disabled} invalid={!!error}>
        <Field.Label>{label}</Field.Label>
        <Input
          {...register(name)}
          type="text"
          placeholder="0.00"
          disabled={disabled}
          inputMode="decimal"
          fontFamily="'JetBrains Mono', monospace"
          _focus={{
            borderColor: isDark ? '#39FF14' : '#1FAE5C',
            boxShadow: isDark ? '0 0 0 2px rgba(57, 255, 20, 0.3)' : '0 0 0 2px rgba(31, 174, 92, 0.3)',
          }}
        />
        {error && <Field.ErrorText>{error.message as string}</Field.ErrorText>}
      </Field.Root>

      <HStack justify="space-between" fontSize="sm">
        <Text color="fg.muted">
          Balance: {balance !== undefined ? `${balance.toFixed(decimals)} ${currency}` : 'Loading...'}
        </Text>
        {showMaxButton && balance !== undefined && balance > 0 && (
          <Button
            size="xs"
            variant="ghost"
            onClick={handleMaxClick}
            disabled={disabled}
            color={isDark ? '#39FF14' : '#1FAE5C'}
            _hover={{ bg: isDark ? 'rgba(57,255,20,0.1)' : 'rgba(31,174,92,0.1)' }}
          >
            MAX
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
