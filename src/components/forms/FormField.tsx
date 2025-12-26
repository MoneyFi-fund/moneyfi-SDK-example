import React from 'react';
import { Field, Input } from '@chakra-ui/react';
import type { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  type?: 'text' | 'number' | 'email';
  children?: React.ReactNode; // For custom inputs (selects, etc.)
}

export function FormField<T extends FieldValues>({
  name,
  label,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  register,
  errors,
  type = 'text',
  children,
}: FormFieldProps<T>) {
  const error = errors[name];

  return (
    <Field.Root required={required} disabled={disabled} invalid={!!error}>
      <Field.Label>{label}</Field.Label>
      {children || (
        <Input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {!error && helperText && <Field.HelperText>{helperText}</Field.HelperText>}
      {error && <Field.ErrorText>{error.message as string}</Field.ErrorText>}
    </Field.Root>
  );
}
