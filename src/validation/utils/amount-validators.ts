import { z } from 'zod';

/**
 * Creates amount validator with balance check
 */
export const createAmountValidator = (
  maxBalance: number,
  decimals: number = 6
) =>
  z
    .string()
    .min(1, 'Amount required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Must be positive')
    .refine(
      (val) => {
        const decimalPlaces = val.split('.')[1]?.length || 0;
        return decimalPlaces <= decimals;
      },
      `Maximum ${decimals} decimal places`
    )
    .refine(
      (val) => Number(val) <= maxBalance,
      `Exceeds balance (${maxBalance.toFixed(decimals)})`
    );

/**
 * Minimum deposit amount validator
 */
export const MIN_DEPOSIT_AMOUNT = 0.01; // $0.01

export const depositAmountValidator = (maxBalance: number) =>
  createAmountValidator(maxBalance, 6).refine(
    (val) => Number(val) >= MIN_DEPOSIT_AMOUNT,
    `Minimum deposit: $${MIN_DEPOSIT_AMOUNT}`
  );
