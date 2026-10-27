import { describe, expect, it } from '@jest/globals';
import { givenEvents } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { aCustomer } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');

describe('Customer', () => {
  it('records its birth, and holds the state that event gives', () => {
    const born = Customer.create('customer-7', bornAt);

    expect(born.registeredAt).toEqual(bornAt);
    expect(born.pullEvents()).toEqual([new CustomerIdentified('customer-7', bornAt)]);
  });

  it('is rebuilt from its history, recording nothing', () => {
    givenEvents((id, history) => Customer.rehydrate(id, history), [new CustomerIdentified('customer-7', bornAt)])
      .when((loaded) => loaded.toState())
      .thenNoEvent()
      .thenState((loaded) => expect(loaded.version).toBe(1));
  });

  it('is built by the builder from the identity and the instant it is born', () => {
    const built = aCustomer().identifiedBy('customer-9').bornAt(bornAt).build();

    expect(built.id).toBe('customer-9');
    expect(built.registeredAt).toEqual(bornAt);
  });
});
