import type { UseFormRegister, FieldErrors, FieldValues } from 'react-hook-form';

/**
 * Base field configuration
 */
export interface FieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Amount input specific config
 */
export interface AmountFieldConfig extends FieldConfig {
  maxBalance?: number;
  showMaxButton?: boolean;
  decimals?: number;
  currency?: string;
}

/**
 * Select field config
 */
export interface SelectFieldConfig extends FieldConfig {
  options: Array<{ value: string; label: string }>;
}

/**
 * Validated field props
 */
export interface ValidatedFieldProps<T extends FieldValues> {
  config: FieldConfig;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
}
