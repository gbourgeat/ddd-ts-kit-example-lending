import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { UnknownBrokerRegistration } from '@/contexts/credit-application/file/domain/errors/unknown-broker-registration.error';

describe('UnknownBrokerRegistration', () => {
  it('refuses for unknown broker registration with the code UNKNOWN_BROKER_REGISTRATION', () => {
    const error = UnknownBrokerRegistration.forUnknownBrokerRegistration();

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('UNKNOWN_BROKER_REGISTRATION');
    expect(error.message).toBe('Unknown broker registration.');
    expect(error.facts).toEqual({});
  });
});
