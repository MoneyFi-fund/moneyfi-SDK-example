import { z } from 'zod';

/**
 * Aptos address validation (0x + 64 hex chars or 0x1::... module format)
 * Rejects EVM addresses (exactly 40 hex chars)
 */
export const aptosAddressValidator = z
  .string()
  .refine(
    (val) => {
      // Reject EVM addresses (exactly 40 hex chars after 0x)
      const evmPattern = /^0x[a-fA-F0-9]{40}$/;
      if (evmPattern.test(val)) {
        return false;
      }

      // Standard address: 0x followed by 1-64 hex characters (but not exactly 40)
      const standardPattern = /^0x[a-fA-F0-9]{1,64}$/;
      // Module address: 0x1::module::function
      const modulePattern = /^0x[a-fA-F0-9]+::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*$/;

      return standardPattern.test(val) || modulePattern.test(val);
    },
    'Invalid Aptos address format'
  );

/**
 * EVM address validation (0x + 40 hex chars, checksummed optional)
 */
export const evmAddressValidator = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM address format');

/**
 * Unified address validator (auto-detects chain type)
 */
export const addressValidator = (chainType: 'aptos' | 'evm') =>
  chainType === 'aptos' ? aptosAddressValidator : evmAddressValidator;
