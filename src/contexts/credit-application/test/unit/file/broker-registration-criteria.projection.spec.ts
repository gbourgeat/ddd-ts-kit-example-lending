import { describe, expect, it } from '@jest/globals';
import { brokerRegistrationCriteria } from '@/contexts/credit-application/file/application/projections/broker-registration-criteria.projection';

describe('Broker registration criteria', () => {
  it('orders the broker registrations by broker identifier when two lines match alike', () => {
    expect(brokerRegistrationCriteria.tieBreaker).toBe('brokerId');
  });
});
