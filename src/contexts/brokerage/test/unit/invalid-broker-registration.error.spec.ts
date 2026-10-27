import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { InvalidBrokerRegistration } from '@/contexts/brokerage/domain/errors/invalid-broker-registration.error';

describe('InvalidBrokerRegistration', () => {
  it('refuses for registration with the code INVALID_BROKER_REGISTRATION', () => {
    const error = InvalidBrokerRegistration.forRegistration('REG-0042');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('INVALID_BROKER_REGISTRATION');
    expect(error.message).toBe('The registration REG-0042 is not valid on the day of the application.');
    expect(error.facts).toEqual({ registrationNumber: 'REG-0042' });
  });
});
