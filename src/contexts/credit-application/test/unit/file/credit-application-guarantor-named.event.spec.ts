import { describe, expect, it } from '@jest/globals';
import { CreditApplicationGuarantorNamed } from '@/contexts/credit-application/file/domain/events/credit-application-guarantor-named.event';

describe('CreditApplicationGuarantorNamed', () => {
  it('is named after the context, the aggregate and the fact, and carries the guarantor named', () => {
    const event = new CreditApplicationGuarantorNamed(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'customer-4',
    );

    expect(event.name).toBe('credit-application.credit-application.guarantor-named');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.guarantorId).toBe('customer-4');
  });
});
