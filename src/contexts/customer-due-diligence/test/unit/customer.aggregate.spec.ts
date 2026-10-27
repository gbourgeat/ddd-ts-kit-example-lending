import { describe, expect, it } from '@jest/globals';
import { expectRefusal, givenEvents } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { aCustomer } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const registeredOn = new Date('2026-02-14T00:00:00.000Z');

const business = {
  legalName: 'Boulangerie Dupont SARL',
  registrationNumber: 'RC-75-123',
  countryOfRegistration: 'FR',
  registeredOn,
};

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

  it('records the registration of its business with the facts of the business', () => {
    const identified = aCustomer().identifiedBy('customer-11').bornAt(bornAt).build();

    identified.registerBusiness(business, bornAt);

    expect(identified.pullEvents()).toEqual([
      new CustomerBusinessRegistered('customer-11', bornAt, 'Boulangerie Dupont SARL', 'RC-75-123', 'FR', registeredOn),
    ]);
  });

  it('holds the business it registered, and the facts of it, once the event is applied', () => {
    const registered = new CustomerBusinessRegistered(
      'customer-11',
      bornAt,
      'Boulangerie Dupont SARL',
      'RC-75-123',
      'FR',
      registeredOn,
    );

    const loaded = aCustomer().identifiedBy('customer-11').bornAt(bornAt).withEvents([registered]).build();

    expect(loaded.toState().business).toEqual(business);
  });

  it('refuses a second registration of its business, and keeps the first one', () => {
    const identified = aCustomer().identifiedBy('customer-12').bornAt(bornAt).build();

    identified.registerBusiness(business, bornAt);

    expectRefusal(
      () => identified.registerBusiness({ ...business, legalName: 'Autre SARL' }, bornAt),
      'BUSINESS_ALREADY_REGISTERED',
    );

    expect(identified.toState().business).toEqual(business);
  });
});
