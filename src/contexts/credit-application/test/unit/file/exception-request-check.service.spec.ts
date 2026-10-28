import { describe, expect, it } from '@jest/globals';
import { ExceptionRequestCheckService } from '@/contexts/credit-application/file/domain/services/exception-request-check.service';

const assessed = {
  decision: undefined,
  lastAssessment: { proposedOutcome: 'approve' },
  exception: undefined,
};

const request = {
  requesterId: 'advisor-1',
  targetLevel: 'risk-manager',
  justification: 'The applicant has a stable salary and a guarantor.',
  requestedAt: new Date('2026-03-02T00:00:00.000Z'),
};

describe('ExceptionRequestCheckService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new ExceptionRequestCheckService())).toEqual([]);
  });

  it('announces the exception with its requester, its level and its justification', () => {
    const event = new ExceptionRequestCheckService().eventOf('credit-application-1', assessed, request);

    expect(event).toMatchObject({
      aggregateId: 'credit-application-1',
      requesterId: 'advisor-1',
      targetLevel: 'risk-manager',
      justification: request.justification,
    });
  });

  it('refuses an exception on an application already decided, by its code', () => {
    const decided = { ...assessed, decision: { outcome: 'refuse' } };

    expect(() => new ExceptionRequestCheckService().eventOf('credit-application-1', decided, request)).toThrow(
      expect.objectContaining({ code: 'ALREADY_DECIDED' }),
    );
  });

  it('refuses an exception on an application not assessed, by its code', () => {
    const notAssessed = { ...assessed, lastAssessment: undefined };

    expect(() => new ExceptionRequestCheckService().eventOf('credit-application-1', notAssessed, request)).toThrow(
      expect.objectContaining({ code: 'NOT_ASSESSED' }),
    );
  });

  it('refuses a second exception while one is already requested, by its code', () => {
    const requested = { ...assessed, exception: request };

    expect(() => new ExceptionRequestCheckService().eventOf('credit-application-1', requested, request)).toThrow(
      expect.objectContaining({ code: 'EXCEPTION_ALREADY_REQUESTED' }),
    );
  });

  it('refuses an exception whose justification is blank, by its code', () => {
    const blank = { ...request, justification: '   ' };

    expect(() => new ExceptionRequestCheckService().eventOf('credit-application-1', assessed, blank)).toThrow(
      expect.objectContaining({ code: 'INVALID_EXCEPTION_JUSTIFICATION' }),
    );
  });
});
