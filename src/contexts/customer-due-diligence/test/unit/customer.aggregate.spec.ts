import { describe, expect, it } from '@jest/globals';
import { givenEvents } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';

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
});
