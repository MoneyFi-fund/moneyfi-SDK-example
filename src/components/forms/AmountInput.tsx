import React from 'react';
import { Box, Button, HStack, Input, Text, VStack } from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import type { UseFormRegister, UseFormSetValue, FieldErrors, FieldValues, Path } from 'react-hook-form';

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
            colorPalette="blue"
            onClick={handleMaxClick}
            disabled={disabled}
          >
            MAX
          </Button>
        )}
      </HStack>
    </VStack>
  );
}
