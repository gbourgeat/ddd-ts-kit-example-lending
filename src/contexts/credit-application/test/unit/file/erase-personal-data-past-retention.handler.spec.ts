import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/credit-application/file/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, creditApplicationPermissions['application.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Erase personal data past retention', () => {
  it('saves the credit application and answers its identifier', async () => {
    const { commandBus, creditApplicationRepository } = arrange();

    const id = await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder));

    expect(id).toBe('credit-application-1');
    expect(await creditApplicationRepository.findById(id)).toBeDefined();
  });

  it('is refused to an actor who does not hold the permission application.erase-past-retention', async () => {
    const { commandBus } = arrange();
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "erase personal data past retention": arrange with the builders of test/builders and the fakes, execute through the bus, assert the stored credit application, the facts announced with the save (`domainEvents.on('<name>', ...)` registered in `arrange`) and the answer; when several specs of credit-application share this arrangement, `npx ddd-ts-kit generate test-world credit-application` writes it once in test/worlds/.
  it.todo('applies the business decision to the credit application');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application to `domainEvents`.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());

  const handler = new ErasePersonalDataPastRetentionHandler(creditApplicationRepository, ids, clock);

  commandBus.use(holders).register(ErasePersonalDataPastRetentionCommand, handler);

  return { commandBus, creditApplicationRepository, domainEvents };
}
