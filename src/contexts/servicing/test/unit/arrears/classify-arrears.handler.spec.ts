import { describe, expect, it } from '@jest/globals';
import type { DomainEvent } from '@ddd-ts-kit/kernel';
import { AuthorizationMap, RoleBasedAuthorizer, authorizationMiddleware, requires } from '@ddd-ts-kit/auth';
import { anActor } from '@ddd-ts-kit/auth/testing';
import { createTestBuses } from '@ddd-ts-kit/testing';
import { servicingPermissions } from '@/contexts/servicing/servicing.permissions';
import { ClassifyArrearsCommand } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.command';
import { ClassifyArrearsHandler } from '@/contexts/servicing/arrears/application/commands/classify-arrears/classify-arrears.handler';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import type { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';

const holders = authorizationMiddleware({
  authorizer: new RoleBasedAuthorizer({
    roles: { holder: [servicingPermissions['loan.classify-arrears']] },
  }),
  map: AuthorizationMap.of(requires(ClassifyArrearsCommand, servicingPermissions['loan.classify-arrears'])),
});

const holder = anActor().withRole('holder').build();
const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const firstInstalmentDueOn = new Date('2026-02-10T00:00:00.000Z');
const tenDaysPastDue = new Date('2026-02-20T00:00:00.000Z');
const fortyDaysPastDue = new Date('2026-03-22T00:00:00.000Z');

describe('Classify arrears', () => {
  it('completes without answering anything', async () => {
    const { commandBus } = arrange();
    const command = new ClassifyArrearsCommand(holder, tenDaysPastDue);

    await expect(commandBus.execute(command)).resolves.toBeUndefined();
  });

  it('is refused to an actor who does not hold the permission loan.classify-arrears', async () => {
    const { commandBus } = arrange();
    const command = new ClassifyArrearsCommand(anActor().build(), tenDaysPastDue);

    await expect(commandBus.execute(command)).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('places a loan in the arrears bucket its days past due put it in', async () => {
    const { commandBus, loanRepository } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new ClassifyArrearsCommand(holder, tenDaysPastDue));

    expect((await loanRepository.findById('loan-1'))?.toState().arrearsBucket).toBe(ArrearsBucket.OneToThirtyDays);
  });

  it('records the bucket entered once when the same classification runs twice', async () => {
    const { commandBus, loanRepository, entered } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new ClassifyArrearsCommand(holder, tenDaysPastDue));
    await commandBus.execute(new ClassifyArrearsCommand(holder, tenDaysPastDue));

    expect(entered.map((event) => event.bucket)).toEqual([ArrearsBucket.OneToThirtyDays]);
  });

  it('records the next bucket entered when the loan goes further past due', async () => {
    const { commandBus, loanRepository, entered } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new ClassifyArrearsCommand(holder, tenDaysPastDue));
    await commandBus.execute(new ClassifyArrearsCommand(holder, fortyDaysPastDue));

    expect(entered.map((event) => event.bucket)).toEqual([
      ArrearsBucket.OneToThirtyDays,
      ArrearsBucket.ThirtyOneToSixtyDays,
    ]);
  });

  it('records nothing for a loan with no instalment unpaid', async () => {
    const { commandBus, loanRepository, entered } = arrange();

    await loanRepository.save(aLoan().identifiedBy('loan-2').bornAt(paidOutOnTheTenthOfJanuary).build());

    await commandBus.execute(new ClassifyArrearsCommand(holder, tenDaysPastDue));

    expect(entered).toEqual([]);
  });

  it('saves and publishes nothing when the command is refused', async () => {
    const { commandBus, loanRepository, entered } = arrange();

    await loanRepository.save(loanUnpaidOnFirstInstalment('loan-1'));

    await commandBus.execute(new ClassifyArrearsCommand(anActor().build(), tenDaysPastDue)).catch(() => undefined);

    expect(entered).toEqual([]);
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
  const entered: LoanArrearsBucketEntered[] = [];

  const asSubscribed = async (event: DomainEvent): Promise<void> => {
    if (event instanceof LoanArrearsBucketEntered) {
      entered.push(event);
    }
  };

  domainEvents.on(LoanArrearsBucketEntered.eventName, asSubscribed, { phase: 'before-commit' });

  const handler = new ClassifyArrearsHandler(loanRepository);

  commandBus.use(holders).register(ClassifyArrearsCommand, handler);

  return { commandBus, loanRepository, entered };
}
