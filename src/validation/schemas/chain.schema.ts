import { z } from 'zod';
import { EVM_CHAINS } from '@/config/chains';

/**
 * EVM chain selection schema
 */
const validChainIds = Object.keys(EVM_CHAINS).map(Number);

export const chainSelectionSchema = z.object({
  chainId: z
    .number()
    .refine(
      (id) => validChainIds.includes(id),
      'Invalid chain selection'
    ),
});

export type ChainSelectionData = z.infer<typeof chainSelectionSchema>;
