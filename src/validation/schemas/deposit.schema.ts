import { z } from 'zod';

/**
 * Deposit form validation schema
 * Used by: Aptos deposit, EVM deposit
 */
export const depositSchema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Amount must be a positive number'
    )
    .refine(
      (val) => {
        const num = Number(val);
        // Check for reasonable decimal precision (6 decimals for USDC/USDT)
        const decimals = val.split('.')[1]?.length || 0;
        return decimals <= 6;
      },
      'Maximum 6 decimal places'
    ),

  tokenAddress: z
    .string()
    .min(1, 'Token selection is required'),
});

/**
 * Deposit form with async balance validation
 */
export const depositSchemaWithBalance = (maxBalance: number) =>
  depositSchema.extend({
    amount: z
      .string()
      .refine(
        (val) => Number(val) <= maxBalance,
        `Amount exceeds available balance (${maxBalance.toFixed(6)})`
      ),
  });

// Type inference
export type DepositFormData = z.infer<typeof depositSchema>;
