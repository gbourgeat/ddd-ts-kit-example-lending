import { describe, expect, it } from '@jest/globals';
import { CreditApplicationRefusalReviewed } from '@/contexts/credit-application/file/domain/events/credit-application-refusal-reviewed.event';

describe('CreditApplicationRefusalReviewed', () => {
  it('is named after the context, the aggregate and the fact, with the reviewer and the conclusion', () => {
    const event = new CreditApplicationRefusalReviewed(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'reviewer-1',
      'overturn',
      'The income was misread.',
    );

    expect(event.name).toBe('credit-application.credit-application.refusal-reviewed');

    expect(event).toMatchObject({
      aggregateId: 'credit-application-1',
      reviewerId: 'reviewer-1',
      conclusion: 'overturn',
    });
  });
});
