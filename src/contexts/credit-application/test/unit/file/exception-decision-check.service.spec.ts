import { describe, expect, it } from '@jest/globals';
import { ExceptionDecisionCheckService } from '@/contexts/credit-application/file/domain/services/exception-decision-check.service';

const requested = {
  requesterId: 'advisor-1',
  targetLevel: 'risk-manager',
  justification: 'Guarantor.',
  requestedAt: new Date(0),
};

const decision = { deciderId: 'committee-1', outcome: 'approve' as const, reasons: 'Sound.', decidedAt: new Date(0) };

describe('ExceptionDecisionCheckService', () => {
  it('records the committee decision on a requested exception', () => {
    const event = new ExceptionDecisionCheckService().eventOf(
      'id-1',
      { decision: undefined, exception: requested, exceptionDecision: undefined },
      decision,
    );

    expect(event.name).toBe('credit-application.credit-application.exception-decided');
    expect(event.outcome).toBe('approve');
  });

  it('refuses a decision when no exception is requested, by its code', () => {
    expect(() =>
      new ExceptionDecisionCheckService().eventOf(
        'id-1',
        { decision: undefined, exception: undefined, exceptionDecision: undefined },
        decision,
      ),
    ).toThrow(expect.objectContaining({ code: 'NO_EXCEPTION_REQUESTED' }));
  });

  it('refuses a second decision on the exception, by its code', () => {
    expect(() =>
      new ExceptionDecisionCheckService().eventOf(
        'id-1',
        { decision: undefined, exception: requested, exceptionDecision: { outcome: 'refuse' } },
        decision,
      ),
    ).toThrow(expect.objectContaining({ code: 'EXCEPTION_ALREADY_DECIDED' }));
  });
});
