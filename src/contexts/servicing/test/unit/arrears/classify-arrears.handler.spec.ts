import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';
import { ClassifyArrearsHandler } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.classify-arrears']] },
  }),
  map: AuthorizationMap.of(requires(ClassifyArrearsCommand, servicingPermissions['loan.classify-arrears'])),
});

const holder = anActor().withRole('holder').build();

describe('Classify arrears', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new ClassifyArrearsCommand(holder);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.classify-arrears', async () => {
    const { commandBus } = arrange();
    const command = new ClassifyArrearsCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "classify arrears": arrange with the builders of test/builders and the fakes, execute through the bus, assert the stored loan, the facts announced with the save (`domainEvents.on('<name>', ...)` registered in `arrange`) and the answer; when several specs of servicing share this arrangement, `npx ddd-ts-kit generate test-world servicing` writes it once in test/worlds/.
  it.todo('applies the business decision to the loan');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus, dispatching, domainEvents } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan to `domainEvents`.
  const loanRepository = dispatching(new FakeLoanRepository());

  const handler = new ClassifyArrearsHandler(loanRepository);

  commandBus.use(holders).register(ClassifyArrearsCommand, handler);

  return { commandBus, loanRepository, domainEvents };
}
