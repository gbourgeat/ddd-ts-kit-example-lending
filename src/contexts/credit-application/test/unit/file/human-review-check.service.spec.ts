import { describe, expect, it } from '@jest/globals';
import { HumanReviewCheckService } from '@/contexts/credit-application/file/domain/services/human-review-check.service';

const requested = { requesterId: 'applicant-1', requestedAt: new Date('2026-03-02T00:00:00.000Z') };

describe('HumanReviewCheckService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new HumanReviewCheckService())).toEqual([]);
  });

  it('answers the request on a refusal the assessment proposed while no one decided', () => {
    const file = { decision: undefined, lastAssessment: { proposedOutcome: 'refuse' } };

    const event = new HumanReviewCheckService().eventOf('credit-application-1', file, requested);

    expect(event).toMatchObject({ aggregateId: 'credit-application-1', requesterId: 'applicant-1' });
  });

  it('answers the request on a decided refusal, even over an approval proposal', () => {
    const file = { decision: { outcome: 'refuse' }, lastAssessment: { proposedOutcome: 'approve' } };

    const event = new HumanReviewCheckService().eventOf('credit-application-1', file, requested);

    expect(event).toMatchObject({ requesterId: 'applicant-1' });
  });

  it('refuses the request on a decided approval, by its code', () => {
    const file = { decision: { outcome: 'approve' }, lastAssessment: { proposedOutcome: 'refuse' } };

    expect(() => new HumanReviewCheckService().eventOf('credit-application-1', file, requested)).toThrow(
      expect.objectContaining({ code: 'HUMAN_REVIEW_NOT_AVAILABLE' }),
    );
  });

  it('refuses the request on an application with no refusal standing, by its code', () => {
    const file = { decision: undefined, lastAssessment: { proposedOutcome: 'approve' } };

    expect(() => new HumanReviewCheckService().eventOf('credit-application-1', file, requested)).toThrow(
      expect.objectContaining({ code: 'HUMAN_REVIEW_NOT_AVAILABLE' }),
    );
  });
});
