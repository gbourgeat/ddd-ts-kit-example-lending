import { describe, expect, it } from '@jest/globals';
import {
  AuthorizationMap,
  PolicyAccess,
  RoleBasedAuthorizer,
  authorizationMiddleware,
  requires,
} from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { FixedClock } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { GetCustomerRiskRatingHandler } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.handler';
import { GetCustomerRiskRatingQuery } from '@/contexts/customer-due-diligence/application/queries/get-customer-risk-rating/get-customer-risk-rating.query';
import { EventStoreGetCustomerRiskRatingReader } from '@/contexts/customer-due-diligence/infrastructure/persistence/event-store-get-customer-risk-rating.reader';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const authorizer = new RoleBasedAuthorizer({
  roles: { reader: [customerDueDiligencePermissions['customer.read-risk']] },
});

const readers = authorizationMiddleware({
  authorizer,
  map: AuthorizationMap.of(requires(GetCustomerRiskRatingQuery, customerDueDiligencePermissions['customer.read-risk'])),
});

const reader = anActor().withRole('reader').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');

describe('Get customer risk rating', () => {
  it('reads back the rating the customer was given', async () => {
    const { queryBus, customers } = arrange();

    await rate('acme', RiskRating.Medium, customers);

    const result = await queryBus.execute(new GetCustomerRiskRatingQuery(reader, 'acme'));

    expect(result).toEqual({ customerId: 'acme', riskRating: RiskRating.Medium });
  });

  it('answers no rating while the customer has none', async () => {
    const { queryBus, customers } = arrange();

    await customers.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    const result = await queryBus.execute(new GetCustomerRiskRatingQuery(reader, 'acme'));

    expect(result).toEqual({ customerId: 'acme' });
  });

  it('refuses the rating of an unknown customer with UNKNOWN_CUSTOMER', async () => {
    const { queryBus } = arrange();

    await expect(queryBus.execute(new GetCustomerRiskRatingQuery(reader, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('is refused to an actor who does not hold the permission customer.read-risk', async () => {
    const { queryBus, customers } = arrange();

    await rate('acme', RiskRating.High, customers);

    const query = new GetCustomerRiskRatingQuery(anActor().build(), 'acme');

    await expect(queryBus.execute(query)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

async function rate(id: string, rating: RiskRating, customers: FakeCustomerRepository): Promise<void> {
  const customer = Customer.create(id, aPersonIdentity(), identifiedOn);

  customer.rateRisk(rating, identifiedOn);
  await customers.save(customer);
}

function arrange() {
  const customers = new FakeCustomerRepository();
  const { queryBus } = createTestBuses();
  const access = new PolicyAccess({ authorizer, clock: new FixedClock(identifiedOn) });
  const handler = new GetCustomerRiskRatingHandler(new EventStoreGetCustomerRiskRatingReader(customers), access);

  return { customers, queryBus: queryBus.use(readers).register(GetCustomerRiskRatingQuery, handler) };
}
