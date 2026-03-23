import { Field, NativeSelectRoot, NativeSelectField } from '@chakra-ui/react';
import type { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { useThemeColors } from '@/provider/theme-provider';

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
  const { isDark } = useThemeColors();
  const error = errors[name];

  return (
    <Field.Root required={required} disabled={disabled} invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      <NativeSelectRoot>
        <NativeSelectField
          {...register(name)}
          placeholder="Select token"
          _focus={{
            borderColor: isDark ? '#39FF14' : '#1FAE5C',
            boxShadow: isDark ? '0 0 0 2px rgba(57, 255, 20, 0.3)' : '0 0 0 2px rgba(31, 174, 92, 0.3)',
          }}
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
