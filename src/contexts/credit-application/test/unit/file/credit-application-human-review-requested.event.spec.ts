import { describe, expect, it } from '@jest/globals';
import { CreditApplicationHumanReviewRequested } from '@/contexts/credit-application/file/domain/events/credit-application-human-review-requested.event';

describe('CreditApplicationHumanReviewRequested', () => {
  it('names the applicant who asked for the review, and the instant of the request', () => {
    const occurredAt = new Date('2026-03-02T00:00:00.000Z');

    const event = new CreditApplicationHumanReviewRequested('credit-application-1', occurredAt, 'applicant-1');

    expect(event.name).toBe('credit-application.credit-application.human-review-requested');
    expect(event).toMatchObject({ aggregateId: 'credit-application-1', occurredAt, requesterId: 'applicant-1' });
  });
});
