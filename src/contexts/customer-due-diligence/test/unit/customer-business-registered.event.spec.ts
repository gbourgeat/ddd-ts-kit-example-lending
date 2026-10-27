import { describe, expect, it } from '@jest/globals';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';

const registeredOn = new Date('2026-02-14T00:00:00.000Z');

describe('CustomerBusinessRegistered', () => {
  it('is named after the context, the aggregate and the fact', () => {
    const event = new CustomerBusinessRegistered(
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'Boulangerie Dupont SARL',
      'RC-75-123',
      'FR',
      registeredOn,
    );

    expect(event.name).toBe('customer-due-diligence.customer.business-registered');
    expect(event.aggregateId).toBe('customer-1');
  });

  it('carries the legal name, the registration number, the country and the date of the registration', () => {
    const event = new CustomerBusinessRegistered(
      'customer-1',
      new Date('2026-01-01T00:00:00.000Z'),
      'Boulangerie Dupont SARL',
      'RC-75-123',
      'FR',
      registeredOn,
    );

    expect(event.legalName).toBe('Boulangerie Dupont SARL');
    expect(event.registrationNumber).toBe('RC-75-123');
    expect(event.countryOfRegistration).toBe('FR');
    expect(event.registeredOn).toEqual(registeredOn);
  });
});
