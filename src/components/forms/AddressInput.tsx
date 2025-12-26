import React from 'react';
import { Input, HStack, Text, Field } from '@chakra-ui/react';
import type { UseFormRegister, UseFormWatch, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { aptosAddressValidator, evmAddressValidator } from '@/validation/utils/address-validators';

interface AddressInputProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  chainType: 'aptos' | 'evm';
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegister<T>;
  watch: UseFormWatch<T>;
  errors: FieldErrors<T>;
}

export function AddressInput<T extends FieldValues>({
  name,
  label,
  chainType,
  required = false,
  disabled = false,
  register,
  watch,
  errors,
}: AddressInputProps<T>) {
  const error = errors[name];
  const value = watch(name);

  // Real-time validation (non-blocking)
  const isValidFormat = React.useMemo(() => {
    if (!value) return null;
    try {
      const validator =
        chainType === 'aptos' ? aptosAddressValidator : evmAddressValidator;
      validator.parse(value);
      return true;
    } catch {
      return false;
    }
  }, [value, chainType]);

  return (
    <Field.Root required={required} disabled={disabled} invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      <Input
        {...register(name)}
        type="text"
        placeholder={chainType === 'aptos' ? '0x...' : '0x...'}
        disabled={disabled}
        fontFamily="monospace"
        fontSize="sm"
      />
      {value && isValidFormat !== null && (
        <HStack mt={1} fontSize="xs">
          <Text color={isValidFormat ? 'green.600' : 'red.600'}>
            {isValidFormat ? '✓ Valid format' : '✗ Invalid format'}
          </Text>
        </HStack>
      )}
      {error && <Field.ErrorText>{error.message as string}</Field.ErrorText>}
    </Field.Root>
  );
}
