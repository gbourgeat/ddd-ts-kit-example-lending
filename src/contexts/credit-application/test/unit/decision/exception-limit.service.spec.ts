import { describe, expect, it } from '@jest/globals';
import { ExceptionLimitService } from '@/contexts/credit-application/decision/domain/services/exception-limit.service';

const requested = { requesterId: 'advisor-1' };

describe('ExceptionLimitService', () => {
  it('lifts the limit of the requester when the committee approved the exception', () => {
    const lifts = new ExceptionLimitService().lifts('advisor-1', {
      exception: requested,
      exceptionDecision: { outcome: 'approve' },
    });

    expect(lifts).toBe(true);
  });

  it('does not lift the limit when the committee refused the exception', () => {
    const lifts = new ExceptionLimitService().lifts('advisor-1', {
      exception: requested,
      exceptionDecision: { outcome: 'refuse' },
    });

    expect(lifts).toBe(false);
  });

  it('does not lift the limit for another decider than the requester', () => {
    const lifts = new ExceptionLimitService().lifts('advisor-2', {
      exception: requested,
      exceptionDecision: { outcome: 'approve' },
    });

    expect(lifts).toBe(false);
  });
});
