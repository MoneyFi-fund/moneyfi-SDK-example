import { z } from 'zod';

/**
 * Withdrawal form validation schema
 * Used by: Aptos withdraw, EVM withdraw
 * Max validation against userStats.total_value
 */
export const withdrawSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Amount must be a positive number'
    ),

  tokenAddress: z
    .string()
    .min(1, 'Token selection is required'),
});

/**
 * Withdraw schema with portfolio limit validation
 */
export const withdrawSchemaWithLimit = (maxPortfolioValue: number) =>
  withdrawSchema.extend({
    amount: z
      .string()
      .refine(
        (val) => Number(val) <= maxPortfolioValue,
        `Amount cannot exceed total portfolio value ($${maxPortfolioValue.toLocaleString()})`
      ),
  });

export type WithdrawFormData = z.infer<typeof withdrawSchema>;
