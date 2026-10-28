import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ErasePersonalDataPastRetentionCommand } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.command';
import { ErasePersonalDataPastRetentionHandler } from '@/contexts/servicing/ledger/application/commands/erase-personal-data-past-retention/erase-personal-data-past-retention.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.erase-past-retention']] },
  }),
  map: AuthorizationMap.of(
    requires(ErasePersonalDataPastRetentionCommand, servicingPermissions['loan.erase-past-retention']),
  ),
});

const holder = anActor().withRole('holder').build();

describe('Erase personal data past retention', () => {
  it('saves the loan and answers its identifier', async () => {
    const { commandBus, loanRepository } = arrange();

    const id = await commandBus.execute(new ErasePersonalDataPastRetentionCommand(holder));

    expect(id).toBe('loan-1');
    expect(await loanRepository.findById(id)).toBeDefined();
  });

  it('is refused to an actor who does not hold the permission loan.erase-past-retention', async () => {
    const { commandBus } = arrange();
    const command = new ErasePersonalDataPastRetentionCommand(anActor().build());

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  // TODO(domain): replace each entry below by a test named after the business behaviour of "erase personal data past retention": arrange with the builders of test/builders and the fakes, execute through the bus, assert the stored loan, the facts announced with the save (`domainEvents.on('<name>', ...)` registered in `arrange`) and the answer; when several specs of servicing share this arrangement, `npx ddd-ts-kit generate test-world servicing` writes it once in test/worlds/.
  it.todo('applies the business decision to the loan');
  it.todo('refuses the command when a business rule is violated, with the expected error code');
  it.todo('saves and publishes nothing when the command is refused');
});

function arrange() {
  const { commandBus, clock, ids, dispatching, domainEvents } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan to `domainEvents`.
  const loanRepository = dispatching(new FakeLoanRepository());

  const handler = new ErasePersonalDataPastRetentionHandler(loanRepository, ids, clock);

  commandBus.use(holders).register(ErasePersonalDataPastRetentionCommand, handler);

  return { commandBus, loanRepository, domainEvents };
}
