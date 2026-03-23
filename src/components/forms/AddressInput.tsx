import React from 'react';
import { Input, HStack, Text, Field } from '@chakra-ui/react';
import type { UseFormRegister, UseFormWatch, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { aptosAddressValidator, evmAddressValidator } from '@/validation/utils/address-validators';
import { useThemeColors } from '@/provider/theme-provider';

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
  const { isDark } = useThemeColors();
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
        _focus={{
          borderColor: isDark ? '#39FF14' : '#1FAE5C',
          boxShadow: isDark ? '0 0 0 2px rgba(57, 255, 20, 0.3)' : '0 0 0 2px rgba(31, 174, 92, 0.3)',
        }}
      />
      {value && isValidFormat !== null && (
        <HStack mt={1} fontSize="xs">
          <Text color={isValidFormat ? (isDark ? '#39FF14' : '#1FAE5C') : (isDark ? '#FF4444' : '#DC2626')}>
            {isValidFormat ? '✓ Valid format' : '✗ Invalid format'}
          </Text>
        </HStack>
      )}
      {error && <Field.ErrorText>{error.message as string}</Field.ErrorText>}
    </Field.Root>
  );
}
