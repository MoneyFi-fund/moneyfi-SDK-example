import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { AmountInput } from '../AmountInput';

function TestWrapper({ balance = 1000, showMaxButton = true }: { balance?: number; showMaxButton?: boolean }) {
  const { register, setValue, formState: { errors } } = useForm<{ amount: string }>();

  return (
    <AmountInput
      name="amount"
      label="Amount"
      balance={balance}
      decimals={6}
      currency="USDC"
      register={register}
      setValue={setValue}
      errors={errors}
      showMaxButton={showMaxButton}
    />
  );
}

describe('AmountInput', () => {
  it('should render label correctly', () => {
    render(<TestWrapper />);
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('should display balance correctly', () => {
    render(<TestWrapper balance={1234.56} />);
    expect(screen.getByText(/Balance: 1234.560000 USDC/)).toBeInTheDocument();
  });

  it('should show loading when balance is undefined', () => {
    function LoadingWrapper() {
      const { register, setValue, formState: { errors } } = useForm<{ amount: string }>();

      return (
        <AmountInput
          name="amount"
          label="Amount"
          balance={undefined}
          register={register}
          setValue={setValue}
          errors={errors}
        />
      );
    }

    render(<LoadingWrapper />);
    expect(screen.getByText(/Balance: Loading.../)).toBeInTheDocument();
  });

  it('should show MAX button when balance > 0', () => {
    render(<TestWrapper balance={100} />);
    expect(screen.getByText('MAX')).toBeInTheDocument();
  });

  it('should hide MAX button when showMaxButton is false', () => {
    render(<TestWrapper showMaxButton={false} />);
    expect(screen.queryByText('MAX')).not.toBeInTheDocument();
  });

  it('should hide MAX button when balance is 0', () => {
    render(<TestWrapper balance={0} />);
    expect(screen.queryByText('MAX')).not.toBeInTheDocument();
  });

  it('should render input with decimal inputMode', () => {
    render(<TestWrapper />);
    const input = screen.getByPlaceholderText('0.00');
    expect(input).toHaveAttribute('inputMode', 'decimal');
  });
});
