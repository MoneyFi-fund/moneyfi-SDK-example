# Validation Patterns

## Overview

Zod schemas + React Hook Form for all form validation.

## Schema Locations

- `/schemas/deposit.schema.ts` - Deposit form
- `/schemas/withdraw.schema.ts` - Withdrawal form
- `/schemas/chain.schema.ts` - Chain selection
- `/schemas/token.schema.ts` - Token selection

## Usage Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { depositSchema } from '@/validation/schemas/deposit.schema';

function DepositForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(depositSchema)
  });

  const onSubmit = (data) => {
    // data is type-safe and validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('amount')} />
      {errors.amount && <span>{errors.amount.message}</span>}
    </form>
  );
}
```

## Custom Validators

- `addressValidator(chainType)` - Aptos/EVM address validation
- `createAmountValidator(max, decimals)` - Amount with balance check
- `createAsyncBalanceValidator(getBalance)` - Async balance validation

## Type Inference

All schemas export inferred types:

```typescript
import { DepositFormData } from '@/validation/schemas/deposit.schema';

const formData: DepositFormData = { amount: '100', tokenAddress: '0x...' };
```
