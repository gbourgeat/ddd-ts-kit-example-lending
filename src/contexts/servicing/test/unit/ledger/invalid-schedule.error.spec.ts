import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidSchedule } from '@/contexts/servicing/ledger/domain/errors/invalid-schedule.error';

describe('InvalidSchedule', () => {
  it('refuses invalid terms with the code INVALID_SCHEDULE, naming the rule that failed', () => {
    const error = InvalidSchedule.forInvalidTerms('the number of months is a whole number, at least one', 0);

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_SCHEDULE');
    expect(error.facts).toEqual({ rule: 'the number of months is a whole number, at least one', value: 0 });
  });
});
