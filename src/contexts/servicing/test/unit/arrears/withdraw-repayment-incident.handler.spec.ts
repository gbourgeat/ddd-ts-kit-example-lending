import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { WithdrawRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.command';
import { WithdrawRepaymentIncidentHandler } from '@/contexts/servicing/arrears/application/commands/withdraw-repayment-incident/withdraw-repayment-incident.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { FakeRepaymentIncidentRegister } from '@/contexts/servicing/test/fakes/repayment-incident-register.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.withdraw-incident']] },
  }),
  map: AuthorizationMap.of(requires(WithdrawRepaymentIncidentCommand, servicingPermissions['loan.withdraw-incident'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const secondInstalmentDueOn = new Date('2026-03-10T00:00:00.000Z');

describe('Withdraw repayment incident', () => {
  it('completes without answering anything', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(declaredLoan('loan-1'));

    await expect(commandBus.execute(new WithdrawRepaymentIncidentCommand(holder, 'loan-1'))).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.withdraw-incident', async () => {
    const { commandBus } = arrange();
    const command = new WithdrawRepaymentIncidentCommand(anActor().build(), 'loan-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('withdraws from the register the declaration of a loan whose arrears are paid', async () => {
    const { commandBus, loanRepository, register } = arrange();

    await loanRepository.save(declaredLoan('loan-1'));
    await register.declare('loan-1');

    await commandBus.execute(new WithdrawRepaymentIncidentCommand(holder, 'loan-1'));

    expect(register.isDeclared('loan-1')).toBe(false);
  });

  it('refuses the withdrawal for an unknown loan with the code UNKNOWN_LOAN', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new WithdrawRepaymentIncidentCommand(holder, 'loan-404'))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });
  });
});

function declaredLoan(id: string): Loan {
  const loan = aLoan().identifiedBy(id).bornAt(paidOutOnTheTenthOfJanuary).build();

  loan.computeDueInstalments(secondInstalmentDueOn);
  loan.markUnpaid(1, secondInstalmentDueOn);
  loan.markUnpaid(2, secondInstalmentDueOn);
  loan.declareRepaymentIncident(secondInstalmentDueOn);

  return loan;
}

function arrange() {
  const { commandBus, clock, dispatching } = createTestBuses({ idPrefix: 'loan' });
  const loanRepository = dispatching(new FakeLoanRepository());
  const register = new FakeRepaymentIncidentRegister();

  commandBus
    .use(holders)
    .register(WithdrawRepaymentIncidentCommand, new WithdrawRepaymentIncidentHandler(loanRepository, register, clock));

  return { commandBus, loanRepository, register };
}
