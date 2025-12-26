import { describe, it, expect } from 'vitest';
import { aptosAddressValidator, evmAddressValidator, addressValidator } from '../address-validators';

describe('Address Validators', () => {
  describe('aptosAddressValidator', () => {
    it('should accept valid Aptos standard address (64 hex chars)', () => {
      const validAddress = '0xbae207659db8c9413922e89e1e8e140f46cb679b060e0a899a9b87a94cb6a4b4';
      const result = aptosAddressValidator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should accept valid Aptos short address (less than 64 chars)', () => {
      const validAddress = '0x1';
      const result = aptosAddressValidator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should accept valid Aptos module address', () => {
      const validAddress = '0x1::coin::CoinStore';
      const result = aptosAddressValidator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should reject invalid Aptos address (missing 0x)', () => {
      const invalidAddress = 'bae207659db8c9413922e89e1e8e140f46cb679b060e0a899a9b87a94cb6a4b4';
      const result = aptosAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it('should reject invalid Aptos address (non-hex chars)', () => {
      const invalidAddress = '0xGHIJ';
      const result = aptosAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it('should reject address exceeding 64 hex chars', () => {
      const invalidAddress = '0x' + 'a'.repeat(65);
      const result = aptosAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });
  });

  describe('evmAddressValidator', () => {
    it('should accept valid EVM address (40 hex chars)', () => {
      const validAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
      const result = evmAddressValidator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should accept valid EVM address (lowercase)', () => {
      const validAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
      const result = evmAddressValidator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should reject invalid EVM address (missing 0x)', () => {
      const invalidAddress = 'af88d065e77c8cC2239327C5EDb3A432268e5831';
      const result = evmAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it('should reject invalid EVM address (non-hex chars)', () => {
      const invalidAddress = '0xGHIJKLMNOPQRSTUVWXYZ1234567890123456';
      const result = evmAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it('should reject address with less than 40 hex chars', () => {
      const invalidAddress = '0xaf88d065';
      const result = evmAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });

    it('should reject address with more than 40 hex chars', () => {
      const invalidAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e58311';
      const result = evmAddressValidator.safeParse(invalidAddress);
      expect(result.success).toBe(false);
    });
  });

  describe('addressValidator (unified)', () => {
    it('should use aptosAddressValidator for aptos chain', () => {
      const validator = addressValidator('aptos');
      const validAddress = '0x1';
      const result = validator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should use evmAddressValidator for evm chain', () => {
      const validator = addressValidator('evm');
      const validAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
      const result = validator.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should reject EVM address on aptos validator', () => {
      const validator = addressValidator('aptos');
      const evmAddress = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
      const result = validator.safeParse(evmAddress);
      expect(result.success).toBe(false);
    });

    it('should reject Aptos module address on evm validator', () => {
      const validator = addressValidator('evm');
      const aptosAddress = '0x1::coin::CoinStore';
      const result = validator.safeParse(aptosAddress);
      expect(result.success).toBe(false);
    });
  });
});
