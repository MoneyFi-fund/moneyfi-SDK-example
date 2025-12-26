import { z } from 'zod';

/**
 * Async balance validation
 * Fetches real-time balance and validates against it
 */
export const createAsyncBalanceValidator = (
  getBalance: () => Promise<number>
) =>
  z
    .string()
    .refine(async (val) => {
      const balance = await getBalance();
      return Number(val) <= balance;
    }, 'Insufficient balance');

/**
 * Example usage:
 *
 * const schema = z.object({
 *   amount: createAsyncBalanceValidator(async () => {
 *     const balance = await fetchWalletBalance();
 *     return balance;
 *   })
 * });
 *
 * // Must use parseAsync
 * const result = await schema.parseAsync({ amount: '100' });
 */
