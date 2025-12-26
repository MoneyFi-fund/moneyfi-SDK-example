import { Field, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import type { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';

interface TokenOption {
  value: string; // Token address
  label: string; // USDC, USDT
  icon?: string; // Optional icon URL
}

interface TokenSelectProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options: TokenOption[];
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
}

export function TokenSelect<T extends FieldValues>({
  name,
  label,
  options,
  required = false,
  disabled = false,
  register,
  errors,
}: TokenSelectProps<T>) {
  const error = errors[name];

  return (
    <Field.Root required={required} disabled={disabled} invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      <NativeSelectRoot>
        <NativeSelectField
          {...register(name)}
          placeholder="Select token"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelectField>
      </NativeSelectRoot>
      {error && <Field.ErrorText>{error.message as string}</Field.ErrorText>}
    </Field.Root>
  );
}

export type { TokenOption };
