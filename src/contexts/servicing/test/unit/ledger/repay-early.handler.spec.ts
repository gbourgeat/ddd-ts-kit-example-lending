import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { RepayEarlyCommand } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.command';
import { RepayEarlyHandler } from '@/contexts/servicing/ledger/application/commands/repay-early/repay-early.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.repay-early']] },
  }),
  map: AuthorizationMap.of(requires(RepayEarlyCommand, servicingPermissions['loan.repay-early'])),
});

const holder = anActor().withRole('holder').build();

describe('Repay early', () => {
  it('repays the capital asked and leaves the rest of it outstanding, saved on the loan', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await commandBus.execute(new RepayEarlyCommand(holder, 'loan-1', 40_000));

    expect((await loanRepository.findById('loan-1'))?.outstandingCapital.cents).toBe(60_000);
  });

  it('closes the loan when the whole outstanding capital is repaid', async () => {
    const { commandBus, loanRepository, clock } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await commandBus.execute(new RepayEarlyCommand(holder, 'loan-1', 100_000));

    expect((await loanRepository.findById('loan-1'))?.closedAt).toEqual(clock.now());
  });

  it('refuses a repayment above the outstanding capital, and saves nothing', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await expect(commandBus.execute(new RepayEarlyCommand(holder, 'loan-1', 100_001))).rejects.toMatchObject({
      code: 'EARLY_REPAYMENT_TOO_HIGH',
    });

    expect((await loanRepository.findById('loan-1'))?.outstandingCapital.cents).toBe(100_000);
  });

  it('is refused to an actor who does not hold the permission loan.repay-early', async () => {
    const { commandBus } = arrange();
    const command = new RepayEarlyCommand(anActor().build(), 'loan-1', 1);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('refuses to repay a loan that does not exist', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new RepayEarlyCommand(holder, 'unknown', 1))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan.
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus.use(holders).register(RepayEarlyCommand, new RepayEarlyHandler(loanRepository, clock));

  return { commandBus, loanRepository, clock };
}
