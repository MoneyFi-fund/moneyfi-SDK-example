import React from 'react';
import { Field, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import type { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { EVM_CHAINS } from '@/config/chains';
import { useThemeColors } from '@/provider/theme-provider';

interface ChainOption {
  chainId: number;
  name: string;
  logo?: string;
  disabled?: boolean;
}

interface ChainSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  allowedChains?: number[]; // Optional filter
}

export function ChainSelect<T extends FieldValues>({
  name,
  label,
  required = false,
  disabled = false,
  register,
  errors,
  allowedChains,
}: ChainSelectProps<T>) {
  const { isDark } = useThemeColors();
  const error = errors[name];

  const chainOptions: ChainOption[] = Object.values(EVM_CHAINS)
    .filter(config => config.chainId !== undefined)
    .map(config => ({
      chainId: config.chainId!,
      name: config.name,
      disabled: allowedChains ? !allowedChains.includes(config.chainId!) : false,
    }));

  return (
    <Field.Root required={required} disabled={disabled} invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      <NativeSelectRoot>
        <NativeSelectField
          {...register(name)}
          placeholder="Select network"
          _focus={{
            borderColor: isDark ? '#39FF14' : '#1FAE5C',
            boxShadow: isDark ? '0 0 0 2px rgba(57, 255, 20, 0.3)' : '0 0 0 2px rgba(31, 174, 92, 0.3)',
          }}
        >
          {chainOptions.map((option) => (
            <option
              key={option.chainId}
              value={option.chainId}
              disabled={option.disabled}
            >
              {option.name} (Chain ID: {option.chainId})
            </option>
          ))}
        </NativeSelectField>
      </NativeSelectRoot>
      {error && <Field.ErrorText>{error.message as string}</Field.ErrorText>}
    </Field.Root>
  );
}

export type { ChainOption };
