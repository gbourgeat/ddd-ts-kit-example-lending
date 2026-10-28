import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { RateCustomerRiskCommand } from '@/contexts/customer-due-diligence/application/commands/rate-customer-risk/rate-customer-risk.command';
import { RateCustomerRiskHandler } from '@/contexts/customer-due-diligence/application/commands/rate-customer-risk/rate-customer-risk.handler';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.rate-risk']] },
  }),
  map: AuthorizationMap.of(requires(RateCustomerRiskCommand, customerDueDiligencePermissions['customer.rate-risk'])),
});

const holder = anActor().withRole('holder').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');

describe('Rate customer risk', () => {
  it('records the risk rating on the customer and answers its identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    const id = await commandBus.execute(new RateCustomerRiskCommand(holder, 'acme', RiskRating.High));

    expect(id).toBe('acme');
    expect((await customerRepository.findById(id))?.toState().riskRating).toBe(RiskRating.High);
  });

  it('replaces an earlier rating, the later one being the rating of the customer', async () => {
    const { commandBus, customerRepository } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));
    await commandBus.execute(new RateCustomerRiskCommand(holder, 'acme', RiskRating.High));

    await commandBus.execute(new RateCustomerRiskCommand(holder, 'acme', RiskRating.Low));

    expect((await customerRepository.findById('acme'))?.toState().riskRating).toBe(RiskRating.Low);
  });

  it('is refused to an actor who does not hold the permission customer.rate-risk', async () => {
    const { commandBus } = arrange();
    const command = new RateCustomerRiskCommand(anActor().build(), 'acme', RiskRating.Low);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses the rating of an unknown customer, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await expect(
      commandBus.execute(new RateCustomerRiskCommand(holder, 'unknown', RiskRating.Low)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CUSTOMER' });

    expect(await customerRepository.findById('unknown')).toBeUndefined();
  });

  it('announces the rating with the save, and nothing when the command is refused', async () => {
    const { commandBus, customerRepository, domainEvents } = arrange();
    const rated: unknown[] = [];

    domainEvents.on('customer-due-diligence.customer.risk-rated', async (event: unknown) => {
      rated.push(event);
    });

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    await commandBus.execute(new RateCustomerRiskCommand(holder, 'acme', RiskRating.Medium));

    await expect(
      commandBus.execute(new RateCustomerRiskCommand(holder, 'unknown', RiskRating.Low)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CUSTOMER' });

    expect(rated).toEqual([expect.objectContaining({ rating: RiskRating.Medium })]);
  });
});

function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new RateCustomerRiskHandler(customerRepository, clock);

  commandBus.use(holders).register(RateCustomerRiskCommand, handler);

  return { commandBus, customerRepository, domainEvents };
}
