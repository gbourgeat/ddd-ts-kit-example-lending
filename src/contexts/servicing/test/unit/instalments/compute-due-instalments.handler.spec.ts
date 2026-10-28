import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';
import { ComputeDueInstalmentsHandler } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.compute-due']] },
  }),
  map: AuthorizationMap.of(requires(ComputeDueInstalmentsCommand, servicingPermissions['loan.compute-due'])),
});

const holder = anActor().withRole('holder').build();

describe('Compute due instalments', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new ComputeDueInstalmentsCommand(holder);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.compute-due', async () => {
    const { commandBus } = arrange();
    const command = new ComputeDueInstalmentsCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "compute due instalments": arrange with the builders of test/builders and the fakes, execute through the bus, assert the stored loan, the facts announced with the save (`domainEvents.on('<name>', ...)` registered in `arrange`) and the answer; when several specs of servicing share this arrangement, `npx ddd-ts-kit generate test-world servicing` writes it once in test/worlds/.
  it.todo('applies the business decision to the loan');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus, dispatching, domainEvents } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan to `domainEvents`.
  const loanRepository = dispatching(new FakeLoanRepository());

  const handler = new ComputeDueInstalmentsHandler(loanRepository);

  commandBus.use(holders).register(ComputeDueInstalmentsCommand, handler);

  return { commandBus, loanRepository, domainEvents };
}
