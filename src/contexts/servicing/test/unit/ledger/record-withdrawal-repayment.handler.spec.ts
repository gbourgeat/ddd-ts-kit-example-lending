import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { RecordWithdrawalRepaymentCommand } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.command';
import { RecordWithdrawalRepaymentHandler } from '@/contexts/servicing/ledger/application/commands/record-withdrawal-repayment/record-withdrawal-repayment.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.record-repayment']] },
  }),
  map: AuthorizationMap.of(requires(RecordWithdrawalRepaymentCommand, servicingPermissions['loan.record-repayment'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOn = new Date('2026-03-01T00:00:00.000Z');
const withdrawnOn = new Date('2026-03-31T00:00:00.000Z');

describe('Record withdrawal repayment', () => {
  it('closes the loan paid out to the application on the instant of the withdrawal', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-1').bornAt(paidOutOn).build());

    await commandBus.execute(withdrawal('loan-1'));

    expect((await loanRepository.findById('loan-1'))?.closedAt).toEqual(withdrawnOn);
  });

  it('does nothing when the withdrawal comes before the payout: no loan exists yet', async () => {
    const { commandBus, loanRepository } = arrange();

    await commandBus.execute(withdrawal('loan-1'));

    expect(await loanRepository.findById('loan-1')).toBeUndefined();
  });

  it('records nothing again when the loan of the application is already closed', async () => {
    const { commandBus, loanRepository } = arrange();
    const closed = aLoan().identifiedBy('loan-1').bornAt(paidOutOn).build();

    closed.close(new Date('2026-03-10T00:00:00.000Z'));
    await loanRepository.save(closed);

    await commandBus.execute(withdrawal('loan-1'));

    expect((await loanRepository.findById('loan-1'))?.closedAt).toEqual(new Date('2026-03-10T00:00:00.000Z'));
  });

  it('is refused to an actor who does not hold the permission loan.record-repayment', async () => {
    const { commandBus } = arrange();
    const stranger = anActor().build();

    await expect(
      commandBus.execute(
        new RecordWithdrawalRepaymentCommand(stranger, { loanId: 'loan-1', withdrawnAt: withdrawnOn }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});

function withdrawal(loanId: string): RecordWithdrawalRepaymentCommand {
  return new RecordWithdrawalRepaymentCommand(holder, { loanId, withdrawnAt: withdrawnOn });
}

function arrange() {
  const { commandBus, dispatching } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan.
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus
    .use(holders)
    .register(RecordWithdrawalRepaymentCommand, new RecordWithdrawalRepaymentHandler(loanRepository));

  return { commandBus, loanRepository };
}
