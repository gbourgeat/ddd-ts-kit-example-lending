import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { WriteOffLoanCommand } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.command';
import { WriteOffLoanHandler } from '@/contexts/servicing/ledger/application/commands/write-off-loan/write-off-loan.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.write-off']] },
  }),
  map: AuthorizationMap.of(requires(WriteOffLoanCommand, servicingPermissions['loan.write-off'])),
});

const holder = anActor().withRole('holder').build();

describe('Write off loan', () => {
  it('writes off the outstanding capital and closes the loan on the instant of the clock', async () => {
    const { commandBus, loanRepository, clock } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());

    await commandBus.execute(new WriteOffLoanCommand(holder, 'loan-1'));

    expect((await loanRepository.findById('loan-1'))?.closedAt).toEqual(clock.now());
  });

  it('refuses to write off a loan twice, with LOAN_ALREADY_CLOSED', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').build());
    await commandBus.execute(new WriteOffLoanCommand(holder, 'loan-1'));

    await expect(commandBus.execute(new WriteOffLoanCommand(holder, 'loan-1'))).rejects.toMatchObject({
      code: 'LOAN_ALREADY_CLOSED',
    });
  });

  it('is refused to an actor who does not hold the permission loan.write-off', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new WriteOffLoanCommand(anActor().build(), 'loan-1'))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('refuses to write off a loan that does not exist', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new WriteOffLoanCommand(holder, 'unknown'))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });
  });
});

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan.
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus.use(holders).register(WriteOffLoanCommand, new WriteOffLoanHandler(loanRepository, clock));

  return { commandBus, loanRepository, clock };
}
