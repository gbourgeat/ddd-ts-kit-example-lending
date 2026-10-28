import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { InMemoryFileStorage } from '@ddd-ts-kit/kernel';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { ReadAccountInformationCommand } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.command';
import { ReadAccountInformationHandler } from '@/contexts/credit-application/assessment/application/commands/read-account-information/read-account-information.handler';
import { SimulatedAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/simulated-account-information-provider.adapter';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.read-accounts']] },
  }),
  map: AuthorizationMap.of(
    requires(ReadAccountInformationCommand, creditApplicationPermissions['application.read-accounts']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Read account information', () => {
  it('is refused to an actor who does not hold the permission application.read-accounts', async () => {
    const { commandBus } = arrange();
    const command = new ReadAccountInformationCommand(anActor().build(), 'credit-application-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses to read the accounts of an application that does not exist, by its code', async () => {
    const { commandBus } = arrange();
    const command = new ReadAccountInformationCommand(holder, 'credit-application-404');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());
  const storage = new InMemoryFileStorage();

  const handler = new ReadAccountInformationHandler(
    creditApplicationRepository,
    new SimulatedAccountInformationProvider(),
    storage,
    clock,
  );

  commandBus.use(holders).register(ReadAccountInformationCommand, handler);

  return { commandBus, creditApplicationRepository, storage };
}
