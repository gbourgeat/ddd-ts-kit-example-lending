import { describe, expect, it } from '@jest/globals';
import { CustomerDirectorsAndOwnersDeclared } from '@/contexts/customer-due-diligence/domain/events/customer-directors-and-owners-declared.event';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

describe('CustomerDirectorsAndOwnersDeclared', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerDirectorsAndOwnersDeclared('customer-1', new Date('2026-01-01T00:00:00.000Z'), [], []);

    expect(event.name).toBe('customer-due-diligence.customer.directors-and-owners-declared');
    expect(event.aggregateId).toBe('customer-1');
  });

  it('carries the directors and the beneficial owners it declares', () => {
    const director = aPersonIdentity({ documentNumber: 'DIRECTOR-1' });
    const owner = aPersonIdentity({ documentNumber: 'OWNER-1' });

    const event = new CustomerDirectorsAndOwnersDeclared(
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
      [director],
      [owner],
    );

    expect(event.directors).toEqual([director]);
    expect(event.beneficialOwners).toEqual([owner]);
  });
});
