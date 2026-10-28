import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { creditApplicationPermissions } from '@/contexts/credit-application/credit-application.permissions';
import { RequestExceptionCommand } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.command';
import { RequestExceptionHandler } from '@/contexts/credit-application/decision/application/commands/request-exception/request-exception.handler';
import { FakeCreditApplicationRepository } from '@/contexts/credit-application/test/fakes/credit-application.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [creditApplicationPermissions['application.request-exception']] },
  }),
  map: AuthorizationMap.of(
    requires(RequestExceptionCommand, creditApplicationPermissions['application.request-exception']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Request exception', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new RequestExceptionCommand(holder);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission application.request-exception', async () => {
    const { commandBus } = arrange();
    const command = new RequestExceptionCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "request exception": arrange with the builders of test/builders and the fakes, execute through the bus, assert the stored credit application, the facts announced with the save (`domainEvents.on('<name>', ...)` registered in `arrange`) and the answer; when several specs of credit-application share this arrangement, `npx ddd-ts-kit generate test-world credit-application` writes it once in test/worlds/.
  it.todo('applies the business decision to the credit application');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus, dispatching, domainEvents } = createTestBuses({ idPrefix: 'credit-application' });
  // As the application hands it to the handler: the save announces the events of the credit application to `domainEvents`.
  const creditApplicationRepository = dispatching(new FakeCreditApplicationRepository());

  const handler = new RequestExceptionHandler(creditApplicationRepository);

  commandBus.use(holders).register(RequestExceptionCommand, handler);

  return { commandBus, creditApplicationRepository, domainEvents };
}
