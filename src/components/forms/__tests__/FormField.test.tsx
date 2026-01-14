import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FormField } from '../FormField';

// Test wrapper component
function TestWrapper() {
  const { register, formState: { errors } } = useForm<{ testField: string }>();

  return (
    <FormField
      name="testField"
      label="Test Field"
      placeholder="Enter value"
      helperText="This is helper text"
      register={register}
      errors={errors}
    />
  );
}

describe('FormField', () => {
  it('should render label correctly', () => {
    render(<TestWrapper />);
    expect(screen.getByText('Test Field')).toBeInTheDocument();
  });

  it('should render input with placeholder', () => {
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText('Enter value');
    expect(input).toBeInTheDocument();
  });

  it('should render helper text', () => {
    render(<TestWrapper />);
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    function DisabledWrapper() {
      const { register, formState: { errors } } = useForm<{ testField: string }>();

      return (
        <FormField
          name="testField"
          label="Test Field"
          register={register}
          errors={errors}
          disabled
        />
      );
    }

    render(<DisabledWrapper />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });
});
