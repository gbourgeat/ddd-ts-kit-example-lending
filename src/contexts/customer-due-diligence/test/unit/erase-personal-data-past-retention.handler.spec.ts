import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { customerDueDiligencePermissions } from '@/contexts/customer-due-diligence/customer-due-diligence.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/customer-due-diligence/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { FakeCustomerRepository } from '@/contexts/customer-due-diligence/test/fakes/customer.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [customerDueDiligencePermissions['customer.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, customerDueDiligencePermissions['customer.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Erase personal data past retention', () => {
  it('saves the customer and answers its identifier', async () => {
    const { commandBus, customerRepository } = arrange();

    const id = await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder));

    expect(id).toBe('customer-1');
    expect(await customerRepository.findById(id)).toBeDefined();
  });

  it('is refused to an actor who does not hold the permission customer.erase-past-retention', async () => {
    const { commandBus } = arrange();
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "erase personal data past retention": arrange with the builders of test/builders and the fakes, execute through the bus, assert the stored customer, the facts announced with the save (`domainEvents.on('<name>', ...)` registered in `arrange`) and the answer; when several specs of customer-due-diligence share this arrangement, `npx ddd-ts-kit generate test-world customer-due-diligence` writes it once in test/worlds/.
  it.todo('applies the business decision to the customer');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'customer' });
  // As the application hands it to the handler: the save announces the events of the customer to `domainEvents`.
  const customerRepository = dispatching(new FakeCustomerRepository());

  const handler = new ErasePersonalDataPastRetentionHandler(customerRepository, ids, clock);

  commandBus.use(holders).register(ErasePersonalDataPastRetentionCommand, handler);

  return { commandBus, customerRepository, domainEvents };
}
