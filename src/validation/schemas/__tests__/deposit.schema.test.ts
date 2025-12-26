import { describe, it, expect } from 'vitest';
import { depositSchema, depositSchemaWithBalance } from '../deposit.schema';

describe('Deposit Schema Validation', () => {
  describe('depositSchema', () => {
    it('should accept valid deposit data', () => {
      const validData = {
        amount: '100.50',
        tokenAddress: '0xbae207659db8c9413922e89e1e8e140f46cb679b060e0a899a9b87a94cb6a4b4',
      };

      const result = depositSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe('100.50');
        expect(result.data.tokenAddress).toBe('0xbae207659db8c9413922e89e1e8e140f46cb679b060e0a899a9b87a94cb6a4b4');
      }
    });

    it('should reject empty amount', () => {
      const invalidData = {
        amount: '',
        tokenAddress: '0x123',
      };

      const result = depositSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount is required');
      }
    });

    it('should reject negative amount', () => {
      const invalidData = {
        amount: '-10',
        tokenAddress: '0x123',
      };

      const result = depositSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be a positive number');
      }
    });

    it('should reject zero amount', () => {
      const invalidData = {
        amount: '0',
        tokenAddress: '0x123',
      };

      const result = depositSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be a positive number');
      }
    });

    it('should reject non-numeric amount', () => {
      const invalidData = {
        amount: 'abc',
        tokenAddress: '0x123',
      };

      const result = depositSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount must be a positive number');
      }
    });

    it('should reject amount with more than 6 decimals', () => {
      const invalidData = {
        amount: '100.1234567',
        tokenAddress: '0x123',
      };

      const result = depositSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Maximum 6 decimal places');
      }
    });

    it('should accept amount with exactly 6 decimals', () => {
      const validData = {
        amount: '100.123456',
        tokenAddress: '0x123',
      };

      const result = depositSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty token address', () => {
      const invalidData = {
        amount: '100',
        tokenAddress: '',
      };

      const result = depositSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Token selection is required');
      }
    });
  });

  describe('depositSchemaWithBalance', () => {
    it('should accept amount within balance', () => {
      const schema = depositSchemaWithBalance(1000);
      const validData = {
        amount: '500',
        tokenAddress: '0x123',
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject amount exceeding balance', () => {
      const maxBalance = 1000;
      const schema = depositSchemaWithBalance(maxBalance);
      const invalidData = {
        amount: '1500',
        tokenAddress: '0x123',
      };

      const result = schema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Amount exceeds available balance');
        expect(result.error.issues[0].message).toContain(maxBalance.toFixed(6));
      }
    });

    it('should accept amount equal to balance', () => {
      const maxBalance = 1000;
      const schema = depositSchemaWithBalance(maxBalance);
      const validData = {
        amount: '1000',
        tokenAddress: '0x123',
      };

      const result = schema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
