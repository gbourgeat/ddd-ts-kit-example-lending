import { describe, expect, it } from '@jest/globals';
import { CreditApplicationRegisterConsulted } from '@/contexts/credit-application/file/domain/events/credit-application-register-consulted.event';

describe('CreditApplicationRegisterConsulted', () => {
  it('is named after the context, the aggregate and the fact, and keeps the listed flags without names', () => {
    const parties = [{ customerId: 'customer-1', listed: true }];

    const event = new CreditApplicationRegisterConsulted(
      'credit-application-1',
      new Date('2026-01-01T00:00:00.000Z'),
      parties,
    );

    expect(event.name).toBe('credit-application.credit-application.register-consulted');
    expect(event.aggregateId).toBe('credit-application-1');
    expect(event.parties).toEqual(parties);
  });
});
