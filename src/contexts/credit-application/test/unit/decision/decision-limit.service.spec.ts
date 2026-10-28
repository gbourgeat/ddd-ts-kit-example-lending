import { describe, expect, it } from '@jest/globals';
import { DecisionLimitService } from '@/contexts/credit-application/decision/domain/services/decision-limit.service';

const levels = [
  { level: 'advisor', amountCents: 1_500_000 },
  { level: 'credit-analyst', amountCents: 7_500_000 },
  { level: 'risk-manager', amountCents: 25_000_000 },
  { level: 'credit-committee', amountCents: 100_000_000 },
];

describe('DecisionLimitService', () => {
  it('lets a decider decide up to the amount of its level', () => {
    expect(() => check({ level: 'advisor', amountCents: 1_500_000 })).not.toThrow();
  });

  it('refuses an amount above the level of the decider, by its code', () => {
    expect(() => check({ level: 'advisor', amountCents: 1_500_001 })).toThrow(
      expect.objectContaining({ code: 'DECISION_ABOVE_LIMIT' }),
    );
  });

  it('refuses a decider whose level is not in the table: nothing is within its limit', () => {
    expect(() => check({ level: 'unknown-level', amountCents: 1 })).toThrow(
      expect.objectContaining({ code: 'DECISION_ABOVE_LIMIT' }),
    );
  });

  it('lets the credit committee decide any amount', () => {
    expect(() => check({ level: 'credit-committee', amountCents: 999_999_999 })).not.toThrow();
  });

  it('refuses the decision of a person who prepared the file, by its code', () => {
    expect(() => check({ level: 'risk-manager', amountCents: 1, preparerIds: ['staff-1'] })).toThrow(
      expect.objectContaining({ code: 'PREPARER_CANNOT_DECIDE' }),
    );
  });

  it('refuses the decision of a person who declared a conflict on the applicant, by its code', () => {
    expect(() => check({ level: 'risk-manager', amountCents: 1, conflictedIds: ['staff-1'] })).toThrow(
      expect.objectContaining({ code: 'CONFLICTED_DECIDER' }),
    );
  });

  it('lets a decider through when the conflicts declared on the applicant name other staff members', () => {
    expect(() => check({ level: 'risk-manager', amountCents: 1, conflictedIds: ['staff-2'] })).not.toThrow();
  });

  it('lets a refusal, which approves nothing, through whatever the level', () => {
    expect(() => check({ level: 'advisor', amountCents: 0 })).not.toThrow();
  });
});

function check(decision: {
  level: string;
  amountCents: number;
  preparerIds?: string[];
  conflictedIds?: string[];
}): void {
  new DecisionLimitService().check({
    deciderId: 'staff-1',
    level: decision.level,
    amountCents: decision.amountCents,
    levels,
    preparerIds: decision.preparerIds ?? [],
    conflictedIds: decision.conflictedIds ?? [],
  });
}
