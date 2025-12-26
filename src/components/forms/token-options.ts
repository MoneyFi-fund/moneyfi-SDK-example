import { APTOS_ADDRESS } from '@/constants/address';
import type { TokenOption } from './TokenSelect';

/**
 * Aptos token options for dropdown selection
 */
export const APTOS_TOKEN_OPTIONS: TokenOption[] = [
  {
    value: APTOS_ADDRESS.USDC,
    label: 'USDC',
  },
  {
    value: APTOS_ADDRESS.USDT,
    label: 'USDT',
  },
];

/**
 * Get EVM token options for a specific chain
 *
 * @param chainId - The EVM chain ID
 * @returns Array of token options for the specified chain
 *
 * Note: Currently returns hardcoded values. In production, this should
 * fetch from the MoneyFi API or use the chain configuration system.
 */
export function getEVMTokenOptions(chainId: number): TokenOption[] {
  // Chain-specific token addresses
  const TOKEN_ADDRESSES: Record<number, { usdc: string; usdt: string }> = {
    // Arbitrum One
    42161: {
      usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    },
    // BSC
    56: {
      usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      usdt: '0x55d398326f99059fF775485246999027B3197955',
    },
    // Base
    8453: {
      usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      usdt: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    },
    // Optimism
    10: {
      usdc: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      usdt: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
    },
    // Core
    1116: {
      usdc: '0xa4151b2b3e269645181dccf2d426ce75fcbdeca9',
      usdt: '0x900101d06a7426441ae63e9ab3b9b0f63be145f1',
    },
  };

  const addresses = TOKEN_ADDRESSES[chainId];

  if (!addresses) {
    console.warn(`No token addresses configured for chain ID: ${chainId}`);
    return [];
  }

  return [
    {
      value: addresses.usdc,
      label: 'USDC',
    },
    {
      value: addresses.usdt,
      label: 'USDT',
    },
  ];
}
