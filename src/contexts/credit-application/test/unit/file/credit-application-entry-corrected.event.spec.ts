import { describe, expect, it } from '@jest/globals';
import { CreditApplicationEntryCorrected } from '@/contexts/credit-application/file/domain/events/credit-application-entry-corrected.event';

describe('CreditApplicationEntryCorrected', () => {
  it('is named after the context, the aggregate and the fact, and carries the entry and the reason', () => {
    const event = new CreditApplicationEntryCorrected(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'credit-application-1#2',
      'Named by mistake',
    );

    expect(event.name).toBe('credit-application.credit-application.entry-corrected');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.correctedEntryId).toBe('credit-application-1#2');
    expect(event.reason).toBe('Named by mistake');
  });
});
