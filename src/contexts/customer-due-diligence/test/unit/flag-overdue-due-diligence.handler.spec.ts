import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { FlagOverdueDueDiligenceCommand } from '@/contexts/customer-due-diligence/application/commands/flag-overdue-due-diligence/flag-overdue-due-diligence.command';
import { FlagOverdueDueDiligenceHandler } from '@/contexts/customer-due-diligence/application/commands/flag-overdue-due-diligence/flag-overdue-due-diligence.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';
import { Customer } from '@/contexts/customer-due-diligence/domain/aggregates/customer.aggregate';
import { aPersonIdentity } from '@/contexts/customer-due-diligence/test/builders/customer.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['due-diligence.flag-overdue']] },
  }),
  map: AuthorizationMap.of(
    requires(FlagOverdueDueDiligenceCommand, customerDueDiligencePermissions['due-diligence.flag-overdue']),
  ),
});

const holder = anActor().withRole('holder').build();
const refreshedOn = new Date('2026-03-02T00:00:00.000Z');
const fiveYearsLater = new Date('2031-03-03T00:00:00.000Z');

describe('Flag overdue due diligence', () => {
  it('flags the due diligence of a customer whose refresh is past its date, at the day of the flag', async () => {
    const { commandBus, customerRepository, clock } = arrange(fiveYearsLater);

    await saveRefreshedCustomer(customerRepository, 'low');

    await commandBus.execute(new FlagOverdueDueDiligenceCommand(holder, 'customer-1'));

    const flagged = await customerRepository.findById('customer-1');

    expect(flagged?.toState().dueDiligenceFlaggedOverdueAt).toEqual(clock.now());
  });

  it('answers the identifier of the customer flagged', async () => {
    const { commandBus, customerRepository } = arrange(fiveYearsLater);

    await saveRefreshedCustomer(customerRepository, 'low');

    const id = await commandBus.execute(new FlagOverdueDueDiligenceCommand(holder, 'customer-1'));

    expect(id).toBe('customer-1');
  });

  it('does not flag a due diligence that is still current', async () => {
    const { commandBus, customerRepository } = arrange(new Date('2027-03-02T00:00:00.000Z'));

    await saveRefreshedCustomer(customerRepository, 'low');

    await commandBus.execute(new FlagOverdueDueDiligenceCommand(holder, 'customer-1'));

    expect((await customerRepository.findById('customer-1'))?.toState().dueDiligenceFlaggedOverdueAt).toBeUndefined();
  });

  it('refuses the flag of an unknown customer, with UNKNOWN_CUSTOMER', async () => {
    const { commandBus } = arrange(fiveYearsLater);

    await expect(commandBus.execute(new FlagOverdueDueDiligenceCommand(holder, 'nobody'))).rejects.toMatchObject({
      code: 'UNKNOWN_CUSTOMER',
    });
  });

  it('is refused to an actor who does not hold the permission due-diligence.flag-overdue', async () => {
    const { commandBus } = arrange(fiveYearsLater);
    const command = new FlagOverdueDueDiligenceCommand(anActor().build(), 'customer-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

/** Saves a customer whose due diligence was refreshed at the given risk rating: it falls due on the cadence of that rating. */
async function saveRefreshedCustomer(
  customerRepository: FakeCustomerRepository,
  rating: 'low' | 'medium' | 'high',
): Promise<void> {
  const customer = Customer.create('customer-1', aPersonIdentity(), refreshedOn);

  customer.rateRisk(rating, refreshedOn);
  customer.refreshDueDiligence('clear', refreshedOn);

  await customerRepository.save(customer);
}

function arrange(now: Date) {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'customer', now });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new FlagOverdueDueDiligenceHandler(customerRepository, clock);

  commandBus.use(holders).register(FlagOverdueDueDiligenceCommand, handler);

  return { commandBus, customerRepository, clock };
}
