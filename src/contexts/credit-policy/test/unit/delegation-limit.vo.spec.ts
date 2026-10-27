import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { DelegationLimit } from '@/contexts/credit-policy/domain/value-objects/delegation-limit.vo';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';

describe('DelegationLimit', () => {
  it('holds the level and the whole amount in cents it was created with', () => {
    const limit = DelegationLimit.create({ level: DelegationLevel.Advisor, amountCents: 1_500_000 });

    expect(limit.level).toBe('advisor');
    expect(limit.amountCents).toBe(1_500_000);
  });

  it('is equal to another limit with the same level and amount', () => {
    const first = DelegationLimit.create({ level: DelegationLevel.RiskManager, amountCents: 25_000_000 });
    const second = DelegationLimit.create({ level: DelegationLevel.RiskManager, amountCents: 25_000_000 });

    expect(first.equals(second)).toBe(true);
  });

  it('refuses an amount that is not a whole number of cents with the code INVALID_DELEGATION_TABLE', () => {
    expectRefusal(
      () => DelegationLimit.create({ level: DelegationLevel.Advisor, amountCents: 15.5 }),
      'INVALID_DELEGATION_TABLE',
    );
  });

  it('refuses a negative amount with the code INVALID_DELEGATION_TABLE', () => {
    expectRefusal(
      () => DelegationLimit.create({ level: DelegationLevel.Advisor, amountCents: -1 }),
      'INVALID_DELEGATION_TABLE',
    );
  });

  it('refuses a level that is not one of the four levels with the code INVALID_DELEGATION_TABLE', () => {
    expectRefusal(
      () => DelegationLimit.create({ level: 'branch-manager' as DelegationLevel, amountCents: 100 }),
      'INVALID_DELEGATION_TABLE',
    );
  });
});
