import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { RecordLatePaymentCommand } from '@/contexts/servicing/instalments/application/commands/record-late-payment/record-late-payment.command';
import { RecordLatePaymentHandler } from '@/contexts/servicing/instalments/application/commands/record-late-payment/record-late-payment.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.record-repayment']] },
  }),
  map: AuthorizationMap.of(requires(RecordLatePaymentCommand, servicingPermissions['loan.record-repayment'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const firstInstalmentDueOn = new Date('2026-02-10T00:00:00.000Z');

describe('Record late payment', () => {
  it('completes without answering anything', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(loanWithUnpaidInstalment('loan-1', 1));

    await expect(commandBus.execute(paymentOf(holder, 'loan-1', 1))).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.record-repayment', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(paymentOf(anActor().build(), 'loan-1', 1))).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('records the late payment of an instalment marked unpaid, which it then no longer carries as unpaid', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(loanWithUnpaidInstalment('loan-1', 1));
    await commandBus.execute(paymentOf(holder, 'loan-1', 1));

    expect((await loanRepository.findById('loan-1'))?.instalmentsPaid).toEqual([1]);
  });

  it('refuses the late payment for an unknown loan with the code UNKNOWN_LOAN', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(paymentOf(holder, 'loan-404', 1))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });
  });
});

function paymentOf(
  actor: ReturnType<typeof anActor>['build'] extends () => infer A ? A : never,
  loanId: string,
  number: number,
) {
  return new RecordLatePaymentCommand(actor, loanId, { number, amountCents: 8_560 });
}

function loanWithUnpaidInstalment(id: string, number: number): Loan {
  const loan = aLoan().identifiedBy(id).bornAt(paidOutOnTheTenthOfJanuary).build();

  loan.computeDueInstalments(firstInstalmentDueOn);
  loan.markUnpaid(number, firstInstalmentDueOn);

  return loan;
}

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  const loanRepository = dispatching(new FakeLoanRepository());

  commandBus.use(holders).register(RecordLatePaymentCommand, new RecordLatePaymentHandler(loanRepository, clock));

  return { commandBus, loanRepository };
}
