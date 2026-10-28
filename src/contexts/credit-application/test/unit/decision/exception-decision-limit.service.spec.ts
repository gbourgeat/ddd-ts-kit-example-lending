import { describe, expect, it } from '@jest/globals';
import { ExceptionDecisionLimitService } from '@/contexts/credit-application/decision/domain/services/exception-decision-limit.service';

const base = { deciderId: 'committee-1', level: 'credit-committee', preparerIds: [], conflictedIds: [] };

describe('ExceptionDecisionLimitService', () => {
  it('lets a member of the credit committee decide an exception', () => {
    expect(() => new ExceptionDecisionLimitService().check(base)).not.toThrow();
  });

  it('refuses a decider below the committee, by its code', () => {
    const decision = { ...base, level: 'advisor' };

    expect(() => new ExceptionDecisionLimitService().check(decision)).toThrow(
      expect.objectContaining({ code: 'NOT_CREDIT_COMMITTEE' }),
    );
  });

  it('refuses the member who prepared the file, by its code', () => {
    const decision = { ...base, preparerIds: ['committee-1'] };

    expect(() => new ExceptionDecisionLimitService().check(decision)).toThrow(
      expect.objectContaining({ code: 'PREPARER_CANNOT_DECIDE' }),
    );
  });
});
