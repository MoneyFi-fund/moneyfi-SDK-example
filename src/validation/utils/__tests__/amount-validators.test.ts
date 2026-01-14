import { describe, it, expect } from 'vitest';
import { createAmountValidator, depositAmountValidator, MIN_DEPOSIT_AMOUNT } from '../amount-validators';

describe('Amount Validators', () => {
  describe('createAmountValidator', () => {
    it('should accept valid amount within balance', () => {
      const validator = createAmountValidator(1000, 6);
      const result = validator.safeParse('500');
      expect(result.success).toBe(true);
    });

    it('should reject empty amount', () => {
      const validator = createAmountValidator(1000);
      const result = validator.safeParse('');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Amount required');
      }
    });

    it('should reject negative amount', () => {
      const validator = createAmountValidator(1000);
      const result = validator.safeParse('-50');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be positive');
      }
    });

    it('should reject zero amount', () => {
      const validator = createAmountValidator(1000);
      const result = validator.safeParse('0');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Must be positive');
      }
    });

    it('should reject amount exceeding max decimals', () => {
      const validator = createAmountValidator(1000, 6);
      const result = validator.safeParse('100.1234567');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Maximum 6 decimal places');
      }
    });

    it('should accept amount with exact decimals', () => {
      const validator = createAmountValidator(1000, 6);
      const result = validator.safeParse('100.123456');
      expect(result.success).toBe(true);
    });

    it('should reject amount exceeding balance', () => {
      const maxBalance = 1000;
      const validator = createAmountValidator(maxBalance, 6);
      const result = validator.safeParse('1500');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Exceeds balance');
      }
    });

    it('should accept amount equal to balance', () => {
      const validator = createAmountValidator(1000);
      const result = validator.safeParse('1000');
      expect(result.success).toBe(true);
    });

    it('should handle custom decimal precision', () => {
      const validator = createAmountValidator(1000, 2);
      const result = validator.safeParse('100.123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Maximum 2 decimal places');
      }
    });
  });

  describe('depositAmountValidator', () => {
    it('should accept valid deposit amount', () => {
      const validator = depositAmountValidator(1000);
      const result = validator.safeParse('100');
      expect(result.success).toBe(true);
    });

    it('should reject amount below minimum deposit', () => {
      const validator = depositAmountValidator(1000);
      const result = validator.safeParse('0.001');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(`Minimum deposit: $${MIN_DEPOSIT_AMOUNT}`);
      }
    });

    it('should accept amount equal to minimum deposit', () => {
      const validator = depositAmountValidator(1000);
      const result = validator.safeParse(MIN_DEPOSIT_AMOUNT.toString());
      expect(result.success).toBe(true);
    });

    it('should still enforce balance limit', () => {
      const maxBalance = 0.005;
      const validator = depositAmountValidator(maxBalance);
      const result = validator.safeParse('0.1');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Exceeds balance');
      }
    });
  });
});
