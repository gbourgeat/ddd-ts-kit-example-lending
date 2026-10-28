import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ComputeDueInstalmentsCommand } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.command';
import { ComputeDueInstalmentsHandler } from '@/contexts/servicing/instalments/application/commands/compute-due-instalments/compute-due-instalments.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.compute-due']] },
  }),
  map: AuthorizationMap.of(requires(ComputeDueInstalmentsCommand, servicingPermissions['loan.compute-due'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const runOnTheTenthOfMarch = new Date('2026-03-10T00:00:00.000Z');

describe('Compute due instalments', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new ComputeDueInstalmentsCommand(holder, runOnTheTenthOfMarch);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.compute-due', async () => {
    const { commandBus } = arrange();
    const command = new ComputeDueInstalmentsCommand(anActor().build(), runOnTheTenthOfMarch);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('records the instalments fallen due on each open loan of the bank, as of the run', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build());

    await commandBus.execute(new ComputeDueInstalmentsCommand(holder, runOnTheTenthOfMarch));

    expect((await loanRepository.findById('loan-1'))?.instalmentsDue).toEqual([1, 2]);
  });

  it('records no instalment for a loan closed before the run', async () => {
    const { commandBus, loanRepository } = arrange();
    const closed = aLoan().identifiedBy('loan-2').bornAt(paidOutOnTheTenthOfJanuary).build();

    closed.close(new Date('2026-02-01T00:00:00.000Z'));
    await loanRepository.save(closed);

    await commandBus.execute(new ComputeDueInstalmentsCommand(holder, runOnTheTenthOfMarch));

    expect((await loanRepository.findById('loan-2'))?.instalmentsDue).toEqual([]);
  });

  it('records each instalment once when the same run is executed twice', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build());

    await commandBus.execute(new ComputeDueInstalmentsCommand(holder, runOnTheTenthOfMarch));
    await commandBus.execute(new ComputeDueInstalmentsCommand(holder, runOnTheTenthOfMarch));

    expect((await loanRepository.findById('loan-1'))?.instalmentsDue).toEqual([1, 2]);
  });
});

function arrange() {
  const { commandBus, dispatching, domainEvents } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan to `domainEvents`.
  const loanRepository = dispatching(new FakeLoanRepository());

  const handler = new ComputeDueInstalmentsHandler(loanRepository);

  commandBus.use(holders).register(ComputeDueInstalmentsCommand, handler);

  return { commandBus, loanRepository, domainEvents };
}
