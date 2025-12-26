import { z } from 'zod';

/**
 * Token selection schema
 * Supports both Aptos (USDC, USDT) and EVM tokens
 */
export const tokenSelectionSchema = z.object({
  tokenType: z.enum(['USDC', 'USDT'], {
    errorMap: () => ({ message: 'Please select a token' }),
  }),

  tokenAddress: z
    .string()
    .min(1, 'Token address required'),
});

export type TokenSelectionData = z.infer<typeof tokenSelectionSchema>;
