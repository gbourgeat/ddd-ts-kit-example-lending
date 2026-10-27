import { describe, expect, it } from '@jest/globals';
import { expectRefusal } from '@ddd-ts-kit/testing';
import { DelegationLimit } from '@/contexts/credit-policy/domain/value-objects/delegation-limit.vo';
import { DelegationTableTerms } from '@/contexts/credit-policy/domain/value-objects/delegation-table-terms.vo';
import { DelegationLevel } from '@/contexts/credit-policy/domain/vocabularies/delegation-level.vocabulary';

const effectiveFrom = new Date('2026-07-01T00:00:00.000Z');

const everyLevel = [
  DelegationLimit.create({ level: DelegationLevel.Advisor, amountCents: 1_500_000 }),
  DelegationLimit.create({ level: DelegationLevel.CreditAnalyst, amountCents: 7_500_000 }),
  DelegationLimit.create({ level: DelegationLevel.RiskManager, amountCents: 25_000_000 }),
  DelegationLimit.create({ level: DelegationLevel.CreditCommittee, amountCents: 100_000_000 }),
];

describe('DelegationTableTerms', () => {
  it('holds the day the table takes effect and the limit of each level', () => {
    const terms = DelegationTableTerms.create({ effectiveFrom, limits: everyLevel });

    expect(terms.effectiveFrom).toEqual(effectiveFrom);
    expect(terms.limits).toHaveLength(4);
  });

  it('refuses a table that leaves out a level with the code INVALID_DELEGATION_TABLE', () => {
    expectRefusal(
      () => DelegationTableTerms.create({ effectiveFrom, limits: everyLevel.slice(0, 3) }),
      'INVALID_DELEGATION_TABLE',
    );
  });

  it('refuses a table that gives a level twice with the code INVALID_DELEGATION_TABLE', () => {
    const advisorAgain = DelegationLimit.create({ level: DelegationLevel.Advisor, amountCents: 1_500_000 });
    const twiceAdvisor = [...everyLevel.slice(0, 3), advisorAgain];

    expectRefusal(
      () => DelegationTableTerms.create({ effectiveFrom, limits: twiceAdvisor }),
      'INVALID_DELEGATION_TABLE',
    );
  });
});
