import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { RefreshDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/refresh-due-diligence/refresh-due-diligence.command';
import { RefreshDueDiligenceHandler } from '@/contexts/customer-due-diligence/application/commands/refresh-due-diligence/refresh-due-diligence.handler';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { RiskRating } from '@/contexts/customer-due-diligence/domain/vocabularies/risk-rating.vocabulary';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { FakeScreeningProvider } from '@/contexts/customer-due-diligence/test/fakes/screening-provider.fake';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['due-diligence.refresh']] },
  }),
  map: AuthorizationMap.of(
    requires(RefreshDueDiligenceCommand, customerDueDiligencePermissions['due-diligence.refresh']),
  ),
});

const holder = anActor().withRole('holder').build();
const identifiedOn = new Date('2026-01-10T00:00:00.000Z');
const birthDate = new Date('1990-01-01T00:00:00.000Z');

describe('Refresh due diligence', () => {
  it('records the refresh, and the date it falls due again, yearly for a customer never rated', async () => {
    const { commandBus, customerRepository, clock } = arrange();

    await customerRepository.save(Customer.create('acme', aPersonIdentity(), identifiedOn));

    const id = await commandBus.execute(new RefreshDueDiligenceCommand(holder, 'acme', 'Ada Lovelace', birthDate));
    const state = (await customerRepository.findById(id))?.toState();

    expect(id).toBe('acme');
    expect(state?.dueDiligenceRefreshedAt).toEqual(clock.now());
    expect(state?.dueDiligenceDueOn?.getUTCFullYear()).toBe(clock.now().getUTCFullYear() + 1);
    expect(state?.riskRating).toBeUndefined();
  });

  it('restates the risk rating of a rated customer and falls due on the cadence of that rating', async () => {
    const { commandBus, customerRepository, clock } = arrange();
    const customer = Customer.create('acme', aPersonIdentity(), identifiedOn);

    customer.rateRisk(RiskRating.Medium, identifiedOn);
    await customerRepository.save(customer);

    await commandBus.execute(new RefreshDueDiligenceCommand(holder, 'acme', 'Ada Lovelace', birthDate));

    const state = (await customerRepository.findById('acme'))?.toState();

    expect(state?.riskRating).toBe(RiskRating.Medium);
    expect(state?.dueDiligenceDueOn?.getUTCFullYear()).toBe(clock.now().getUTCFullYear() + 3);
  });

  it('refuses the refresh of an unknown customer, and saves nothing', async () => {
    const { commandBus, customerRepository } = arrange();

    await expect(
      commandBus.execute(new RefreshDueDiligenceCommand(holder, 'unknown', 'Ada Lovelace', birthDate)),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CUSTOMER' });

    expect(await customerRepository.findById('unknown')).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission due-diligence.refresh', async () => {
    const { commandBus } = arrange();
    const command = new RefreshDueDiligenceCommand(anActor().build(), 'acme', 'Ada Lovelace', birthDate);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer to the bus of events.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new RefreshDueDiligenceHandler(customerRepository, new FakeScreeningProvider(), clock);

  commandBus.use(holders).register(RefreshDueDiligenceCommand, handler);

  return { commandBus, customerRepository, clock };
}
