import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { FlagAllOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.command';
import { FlagAllOverdueDueDiligenceHandler } from '@/contexts/customer-due-diligence/application/commands/flag-all-overdue-due-diligence/flag-all-overdue-due-diligence.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['due-diligence.flag-overdue']] },
  }),
  map: AuthorizationMap.of(
    requires(FlagAllOverdueDueDiligenceCommand, customerDueDiligencePermissions['due-diligence.flag-overdue']),
  ),
});

const holder = anActor().withRole('holder').build();
const refreshedOn = new Date('2026-03-02T00:00:00.000Z');
/** High risk falls due one year after the refresh, low risk five years after it. */
const dueBeforeOneYearOn = new Date('2028-01-01T00:00:00.000Z');

describe('Flag all overdue due diligence', () => {
  it('flags the overdue due diligence of a customer falling due before the instant, and leaves a current one unflagged', async () => {
    const { commandBus, customerRepository, clock } = arrange(dueBeforeOneYearOn);

    await saveRefreshedCustomer(customerRepository, 'customer-high', 'high');
    await saveRefreshedCustomer(customerRepository, 'customer-low', 'low');

    await commandBus.execute(new FlagAllOverdueDueDiligenceCommand(holder, dueBeforeOneYearOn));

    const high = await customerRepository.findById('customer-high');
    const low = await customerRepository.findById('customer-low');

    expect(high?.toState().dueDiligenceFlaggedOverdueAt).toEqual(clock.now());
    expect(low?.toState().dueDiligenceFlaggedOverdueAt).toBeUndefined();
  });

  it('answers how many customers had a due diligence falling due before the instant', async () => {
    const { commandBus, customerRepository } = arrange(dueBeforeOneYearOn);

    await saveRefreshedCustomer(customerRepository, 'customer-high', 'high');
    await saveRefreshedCustomer(customerRepository, 'customer-low', 'low');

    const count = await commandBus.execute(new FlagAllOverdueDueDiligenceCommand(holder, dueBeforeOneYearOn));

    expect(count).toBe(1);
  });

  it('answers zero and flags nothing when no due diligence falls due before the instant', async () => {
    const { commandBus, customerRepository } = arrange(dueBeforeOneYearOn);

    await saveRefreshedCustomer(customerRepository, 'customer-low', 'low');

    const count = await commandBus.execute(
      new FlagAllOverdueDueDiligenceCommand(holder, new Date('2026-06-01T00:00:00.000Z')),
    );

    expect(count).toBe(0);
    expect((await customerRepository.findById('customer-low'))?.toState().dueDiligenceFlaggedOverdueAt).toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission due-diligence.flag-overdue', async () => {
    const { commandBus } = arrange(dueBeforeOneYearOn);
    const command = new FlagAllOverdueDueDiligenceCommand(anActor().build(), dueBeforeOneYearOn);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** Saves a customer whose due diligence was refreshed at the given risk rating: it falls due on the cadence of that rating. */
async function saveRefreshedCustomer(
  customerRepository: FakeCustomerRepository,
  id: string,
  rating: 'low' | 'medium' | 'high',
): Promise<void> {
  const customer = Customer.create(id, aPersonIdentity(), refreshedOn);

  customer.rateRisk(rating, refreshedOn);
  customer.refreshDueDiligence('clear', refreshedOn);

  await customerRepository.save(customer);
}

function arrange(now: Date) {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer', now });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new FlagAllOverdueDueDiligenceHandler(customerRepository, clock);

  commandBus.use(holders).register(FlagAllOverdueDueDiligenceCommand, handler);

  return { commandBus, customerRepository, clock };
}
