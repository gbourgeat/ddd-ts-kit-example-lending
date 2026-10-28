import { describe, expect, it } from '@jest/globals';
import { ExceptionLevelService } from '@/contexts/credit-application/decision/domain/services/exception-level.service';

const levels = [
  { level: 'advisor', amountCents: 1_500_000 },
  { level: 'credit-analyst', amountCents: 7_500_000 },
  { level: 'risk-manager', amountCents: 25_000_000 },
  { level: 'credit-committee', amountCents: 100_000_000 },
];

describe('ExceptionLevelService', () => {
  it('sends the exception to the level above the one the amount needs', () => {
    expect(of({ level: 'advisor', amountCents: 5_000_000 })).toBe('risk-manager');
    expect(of({ level: 'credit-analyst', amountCents: 8_000_000 })).toBe('credit-committee');
  });

  it('never sends an exception under a risk manager', () => {
    expect(of({ level: 'advisor', amountCents: 2_000_000 })).toBe('risk-manager');
  });

  it('sends an amount no level covers to the credit committee', () => {
    expect(of({ level: 'risk-manager', amountCents: 200_000_000 })).toBe('credit-committee');
  });

  it('refuses an exception the limit of the decider already covers, by its code', () => {
    expect(() => of({ level: 'advisor', amountCents: 1_500_000 })).toThrow(
      expect.objectContaining({ code: 'EXCEPTION_NOT_ABOVE_LIMIT' }),
    );
  });

  it('refuses an exception from the credit committee, which decides any amount, by its code', () => {
    expect(() => of({ level: 'credit-committee', amountCents: 999_999_999 })).toThrow(
      expect.objectContaining({ code: 'EXCEPTION_NOT_ABOVE_LIMIT' }),
    );
  });

  it('refuses an exception asked by the person who prepared the file, by its code', () => {
    expect(() => of({ level: 'advisor', amountCents: 5_000_000, preparerIds: ['decider-1'] })).toThrow(
      expect.objectContaining({ code: 'PREPARER_CANNOT_DECIDE' }),
    );
  });

  it('refuses an exception asked by a person who declared a conflict on the applicant, by its code', () => {
    expect(() => of({ level: 'advisor', amountCents: 5_000_000, conflictedIds: ['decider-1'] })).toThrow(
      expect.objectContaining({ code: 'CONFLICTED_DECIDER' }),
    );
  });
});

function of(
  overrides: {
    level: string;
    amountCents: number;
    preparerIds?: readonly string[];
    conflictedIds?: readonly string[];
  } = { level: 'advisor', amountCents: 0 },
): string {
  return new ExceptionLevelService().of({
    deciderId: 'decider-1',
    levels,
    preparerIds: overrides.preparerIds ?? [],
    conflictedIds: overrides.conflictedIds ?? [],
    ...overrides,
  });
}
