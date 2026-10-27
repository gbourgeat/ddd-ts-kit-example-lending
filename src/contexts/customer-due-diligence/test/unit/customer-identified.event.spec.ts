import { describe, expect, it } from '@jest/globals';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

describe('CustomerIdentified', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerIdentified('customer-1', new Date('2026-01-01T00:00:00.000Z'), aPersonIdentity());

    expect(event.name).toBe('customer-due-diligence.customer.identified');
    expect(event.aggregateId).toBe('customer-1');
  });

  it('carries the identity document and the proof of address the bank checked', () => {
    const identity = aPersonIdentity({ documentNumber: '99ZZ00011' });

    const event = new CustomerIdentified('customer-1', new Date('2026-01-01T00:00:00.000Z'), identity);

    expect(event.identity).toEqual(identity);
  });
});
