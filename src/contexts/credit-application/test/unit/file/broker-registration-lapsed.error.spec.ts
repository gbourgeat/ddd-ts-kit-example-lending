import { describe, expect, it } from '@jest/globals';
import { DomainRefusal } from '@ddd-ts-kit/kernel';
import { BrokerRegistrationLapsed } from '@/contexts/credit-application/file/domain/errors/broker-registration-lapsed.error';

describe('BrokerRegistrationLapsed', () => {
  it('refuses a broker whose registration lapsed, with the code BROKER_REGISTRATION_LAPSED and the broker named', () => {
    const error = BrokerRegistrationLapsed.forBroker('broker-1');

    expect(error).toBeInstanceOf(DomainRefusal);
    expect(error.code).toBe('BROKER_REGISTRATION_LAPSED');
    expect(error.message).toBe('The registration of the broker lapsed: the broker may not bring an application.');
    expect(error.facts).toEqual({ brokerId: 'broker-1' });
  });
});
