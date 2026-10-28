import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { DeclareRepaymentIncidentCommand } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.command';
import { DeclareRepaymentIncidentHandler } from '@/contexts/servicing/arrears/application/commands/declare-repayment-incident/declare-repayment-incident.handler';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { FakeRepaymentIncidentRegister } from '@/contexts/servicing/test/fakes/repayment-incident-register.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.declare-incident']] },
  }),
  map: AuthorizationMap.of(requires(DeclareRepaymentIncidentCommand, servicingPermissions['loan.declare-incident'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const secondInstalmentDueOn = new Date('2026-03-10T00:00:00.000Z');

describe('Declare repayment incident', () => {
  it('completes without answering anything', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(loanWithUnpaidInstalments('loan-1', [1, 2]));

    await expect(commandBus.execute(new DeclareRepaymentIncidentCommand(holder, 'loan-1'))).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.declare-incident', async () => {
    const { commandBus } = arrange();
    const command = new DeclareRepaymentIncidentCommand(anActor().build(), 'loan-1');

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('declares to the register a loan whose two consecutive instalments are unpaid', async () => {
    const { commandBus, loanRepository, register } = arrange();

    await loanRepository.save(loanWithUnpaidInstalments('loan-1', [1, 2]));
    await commandBus.execute(new DeclareRepaymentIncidentCommand(holder, 'loan-1'));

    expect(register.isDeclared('loan-1')).toBe(true);
  });

  it('declares nothing for a loan whose unpaid instalments are not consecutive', async () => {
    const { commandBus, loanRepository, register } = arrange();

    await loanRepository.save(loanWithUnpaidInstalments('loan-1', [1, 3]));
    await commandBus.execute(new DeclareRepaymentIncidentCommand(holder, 'loan-1'));

    expect(register.isDeclared('loan-1')).toBe(false);
  });

  it('declares the incident once when the command runs again', async () => {
    const { commandBus, loanRepository, declared } = arrange();

    await loanRepository.save(loanWithUnpaidInstalments('loan-1', [1, 2]));
    await commandBus.execute(new DeclareRepaymentIncidentCommand(holder, 'loan-1'));
    await commandBus.execute(new DeclareRepaymentIncidentCommand(holder, 'loan-1'));

    expect(declared).toHaveLength(1);
  });

  it('refuses the command for an unknown loan with the code UNKNOWN_LOAN', async () => {
    const { commandBus } = arrange();

    await expect(commandBus.execute(new DeclareRepaymentIncidentCommand(holder, 'loan-404'))).rejects.toMatchObject({
      code: 'UNKNOWN_LOAN',
    });
  });
});

function loanWithUnpaidInstalments(id: string, unpaid: readonly number[]): Loan {
  const loan = aLoan().identifiedBy(id).bornAt(paidOutOnTheTenthOfJanuary).build();

  loan.computeDueInstalments(secondInstalmentDueOn);

  for (const number of unpaid) {
    loan.markUnpaid(number, secondInstalmentDueOn);
  }

  return loan;
}

function arrange() {
  const { commandBus, clock, dispatching, domainEvents } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan to `domainEvents`.
  const loanRepository = dispatching(new FakeLoanRepository());
  const register = new FakeRepaymentIncidentRegister();
  const declared: string[] = [];

  domainEvents.on(
    'servicing.loan.repayment-incident-declared',
    async (event) => {
      declared.push(event.aggregateId);
    },
    { phase: 'before-commit' },
  );

  commandBus
    .use(holders)
    .register(DeclareRepaymentIncidentCommand, new DeclareRepaymentIncidentHandler(loanRepository, register, clock));

  return { commandBus, loanRepository, register, domainEvents, declared };
}
