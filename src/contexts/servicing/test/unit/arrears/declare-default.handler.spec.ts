import { describe, expect, it } from '@jest/globals';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import type { DomainEvent } from '@ddd-ts-kit/kernel';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { DeclareDefaultCommand } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.command';
import { DeclareDefaultHandler } from '@/contexts/servicing/arrears/application/commands/declare-default/declare-default.handler';
import { LoanDefaulted } from '@/contexts/servicing/arrears/domain/events/loan-defaulted.event';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.declare-default']] },
  }),
  map: AuthorizationMap.of(requires(DeclareDefaultCommand, servicingPermissions['loan.declare-default'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const firstInstalmentDueOn = new Date('2026-02-10T00:00:00.000Z');
const eightyNineDaysPastDue = new Date('2026-05-10T00:00:00.000Z');
const ninetyDaysPastDue = new Date('2026-05-11T00:00:00.000Z');

describe('Declare default', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new DeclareDefaultCommand(holder, ninetyDaysPastDue);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.declare-default', async () => {
    const { commandBus } = arrange();
    const command = new DeclareDefaultCommand(anActor().build(), ninetyDaysPastDue);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('declares in default a loan 90 days past due, handed to collections', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new DeclareDefaultCommand(holder, ninetyDaysPastDue));

    expect((await loanRepository.findById('loan-1'))?.toState().defaultedAt).toEqual(ninetyDaysPastDue);
  });

  it('does not declare in default a loan 89 days past due', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new DeclareDefaultCommand(holder, eightyNineDaysPastDue));

    expect((await loanRepository.findById('loan-1'))?.toState().defaultedAt).toBeUndefined();
  });

  it('announces the default once when the declaration runs again', async () => {
    const { commandBus, loanRepository, declared } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new DeclareDefaultCommand(holder, ninetyDaysPastDue));
    await commandBus.execute(new DeclareDefaultCommand(holder, ninetyDaysPastDue));

    expect(declared).toHaveLength(1);
  });

  it('declares no default for a loan with no instalment unpaid', async () => {
    const { commandBus, loanRepository, declared } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-2').bornAt(paidOutOnTheTenthOfJanuary).build());

    await commandBus.execute(new DeclareDefaultCommand(holder, ninetyDaysPastDue));

    expect(declared).toEqual([]);
  });

  it('saves and publishes nothing when the command is refused', async () => {
    const { commandBus, loanRepository, declared } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new DeclareDefaultCommand(anActor().build(), ninetyDaysPastDue)).catch(() => undefined);

    expect(declared).toEqual([]);
  });
});

function loanUnpaidOnFirstInstalment(id: string): Loan {
  const loan = aLoan().identifiedBy(id).bornAt(paidOutOnTheTenthOfJanuary).build();

  loan.computeDueInstalments(firstInstalmentDueOn);
  loan.markUnpaid(1, firstInstalmentDueOn);

  return loan;
}

function arrange() {
  const { commandBus, dispatching, domainEvents } = createTestBuses({ idPrefix: 'loan' });
  // As the application hands it to the handler: the save announces the events of the loan to `domainEvents`.
  const loanRepository = dispatching(new FakeLoanRepository());
  const declared: LoanDefaulted[] = [];

  const asSubscribed = async (event: DomainEvent): Promise<void> => {
    if (event instanceof LoanDefaulted) {
      declared.push(event);
    }
  };

  domainEvents.on(LoanDefaulted.eventName, asSubscribed, { phase: 'before-commit' });

  const handler = new DeclareDefaultHandler(loanRepository);

  commandBus.use(holders).register(DeclareDefaultCommand, handler);

  return { commandBus, loanRepository, declared };
}
