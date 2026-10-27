import { describe, expect, it } from '@jest/globals';
import { expectRefusal, givenEvents } from '@ddd-ts-kit/testing';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { CustomerIdentified } from '@/contexts/customer-due-diligence/domain/events/customer-identified.event';
import { CustomerBusinessRegistered } from '@/contexts/customer-due-diligence/domain/events/customer-business-registered.event';
import { CustomerPossibleMatchFound } from '@/contexts/customer-due-diligence/domain/events/customer-possible-match-found.event';
import { CustomerSanctionsMatchConfirmed } from '@/contexts/customer-due-diligence/domain/events/customer-sanctions-match-confirmed.event';
import { CustomerRelationshipEnded } from '@/contexts/customer-due-diligence/domain/events/customer-relationship-ended.event';
import { aCustomer, aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const registeredOn = new Date('2026-02-14T00:00:00.000Z');

const business = {
  legalName: 'Boulangerie Dupont SARL',
  registrationNumber: 'RC-75-123',
  countryOfRegistration: 'FR',
  registeredOn,
};

describe('Customer', () => {
  it('records its birth with the identity it was checked on, and holds the state that event gives', () => {
    const born = Customer.create('customer-7', aPersonIdentity(), bornAt);

    expect(born.registeredAt).toEqual(bornAt);
    expect(born.pullEvents()).toEqual([new CustomerIdentified('customer-7', bornAt, aPersonIdentity())]);
  });

  it('refuses to identify a person whose identity document expired before the day', () => {
    const expired = aPersonIdentity({ documentExpiresOn: new Date('2025-12-31T00:00:00.000Z') });

    expectRefusal(() => Customer.create('customer-8', expired, bornAt), 'IDENTITY_DOCUMENT_EXPIRED');
  });

  it('refuses to identify a person whose proof of address is dated more than three months before the day', () => {
    const stale = aPersonIdentity({ addressProofDatedOn: new Date('2025-11-30T23:59:59.000Z') });

    expectRefusal(() => Customer.create('customer-8', stale, bornAt), 'PROOF_OF_ADDRESS_TOO_OLD');
  });

  it('accepts a proof of address dated exactly three months before the day', () => {
    const threeMonthsOld = aPersonIdentity({ addressProofDatedOn: new Date('2026-01-01T00:00:00.000Z') });

    const born = Customer.create('customer-8', threeMonthsOld, new Date('2026-04-01T00:00:00.000Z'));

    expect(born.pullEvents()).toHaveLength(1);
  });

  it('is rebuilt from its history, recording nothing', () => {
    givenEvents(
      (id, history) => Customer.rehydrate(id, history),
      [new CustomerIdentified('customer-7', bornAt, aPersonIdentity())],
    )
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

describe('Customer, once its screening found a possible match, and when its relationship ends', () => {
  it('ends the relationship with a customer, recording the instant it ends', () => {
    const customer = aCustomer().identifiedBy('customer-16').bornAt(bornAt).build();

    customer.endRelationship(registeredOn);

    expect(customer.pullEvents()).toEqual([new CustomerRelationshipEnded('customer-16', registeredOn)]);
    expect(customer.toState().relationshipEndedAt).toEqual(registeredOn);
  });

  it('records no second end of a relationship already ended', () => {
    const ended = aCustomer()
      .identifiedBy('customer-17')
      .bornAt(bornAt)
      .withEvents([new CustomerRelationshipEnded('customer-17', registeredOn)])
      .build();

    ended.endRelationship(bornAt);

    expect(ended.pullEvents()).toEqual([]);
    expect(ended.toState().relationshipEndedAt).toEqual(registeredOn);
  });

  it('confirms a possible match as a sanctions match, recording the instant of the confirmation', () => {
    const screened = aCustomer()
      .identifiedBy('customer-13')
      .bornAt(bornAt)
      .withEvents([new CustomerPossibleMatchFound('customer-13', bornAt)])
      .build();

    screened.confirmSanctionsMatch(registeredOn);

    expect(screened.pullEvents()).toEqual([new CustomerSanctionsMatchConfirmed('customer-13', registeredOn)]);
    expect(screened.toState().sanctionsMatchConfirmedAt).toEqual(registeredOn);
  });

  it('refuses to confirm a customer with no possible match waiting for compliance review', () => {
    const identified = aCustomer().identifiedBy('customer-14').bornAt(bornAt).build();

    expectRefusal(() => identified.confirmSanctionsMatch(registeredOn), 'NO_POSSIBLE_MATCH');
  });

  it('refuses to confirm a match twice, the second confirmation records nothing', () => {
    const confirmed = aCustomer()
      .identifiedBy('customer-15')
      .bornAt(bornAt)
      .withEvents([
        new CustomerPossibleMatchFound('customer-15', bornAt),
        new CustomerSanctionsMatchConfirmed('customer-15', registeredOn),
      ])
      .build();

    expectRefusal(() => confirmed.confirmSanctionsMatch(registeredOn), 'NO_POSSIBLE_MATCH');
    expect(confirmed.pullEvents()).toEqual([]);
  });
});
