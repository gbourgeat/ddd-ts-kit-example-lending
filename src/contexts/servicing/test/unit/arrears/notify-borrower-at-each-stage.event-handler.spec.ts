import { describe, expect, it } from '@jest/globals';
import { InMemoryDomainEventDispatcher, InMemoryUnitOfWork, announceDomainEvents } from '@ddd-ts-kit/kernel';
import { NotifyBorrowerAtEachStageEventHandler } from '@/contexts/servicing/arrears/application/event-handlers/notify-borrower-at-each-stage.event-handler';
import { LoanArrearsBucketEntered } from '@/contexts/servicing/arrears/domain/events/loan-arrears-bucket-entered.event';
import { ArrearsBucket } from '@/contexts/servicing/arrears/domain/vocabularies/arrears-bucket.vocabulary';
import { FakeBorrowerNotifier } from '@/contexts/servicing/test/fakes/borrower-notifier.fake';
import { FakeLoanRepository } from '@/contexts/servicing/test/fakes/loan.repository.fake';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import { Borrower } from '@/contexts/servicing/ledger/domain/value-objects/borrower.vo';

const enteredOn = new Date('2026-02-20T00:00:00.000Z');

describe('When loan arrears bucket entered', () => {
  it('gives the borrower one notice naming the stage the loan entered', async () => {
    const loanRepository = await arrangeLoan();
    const borrowerNotifier = new FakeBorrowerNotifier();
    const handler = new NotifyBorrowerAtEachStageEventHandler(loanRepository, borrowerNotifier);

    await handler.handle(new LoanArrearsBucketEntered('loan-1', enteredOn, ArrearsBucket.OneToThirtyDays));

    expect(borrowerNotifier.sent).toEqual([
      { borrowerName: 'Ada Lovelace', message: 'Your loan is in arrears: 1 to 30 days past due.' },
    ]);
  });

  it('gives a different notice for each stage the loan enters', async () => {
    const loanRepository = await arrangeLoan();
    const borrowerNotifier = new FakeBorrowerNotifier();
    const handler = new NotifyBorrowerAtEachStageEventHandler(loanRepository, borrowerNotifier);

    await handler.handle(new LoanArrearsBucketEntered('loan-1', enteredOn, ArrearsBucket.OneToThirtyDays));
    await handler.handle(new LoanArrearsBucketEntered('loan-1', enteredOn, ArrearsBucket.OverNinetyDays));

    expect(new Set(borrowerNotifier.sent.map((notice) => notice.message)).size).toBe(2);
  });

  it('does nothing when the loan is unknown', async () => {
    const borrowerNotifier = new FakeBorrowerNotifier();
    const handler = new NotifyBorrowerAtEachStageEventHandler(new FakeLoanRepository(), borrowerNotifier);

    await handler.handle(new LoanArrearsBucketEntered('loan-404', enteredOn, ArrearsBucket.OneToThirtyDays));

    expect(borrowerNotifier.sent).toEqual([]);
  });

  it('after the commit, a failing notifier is reported and does not undo the classification', async () => {
    const loanRepository = await arrangeLoan();

    const failingNotifier = {
      notify: async (): Promise<void> => {
        throw new Error('the mail service is down');
      },
    };

    const handler = new NotifyBorrowerAtEachStageEventHandler(loanRepository, failingNotifier);
    const event = new LoanArrearsBucketEntered('loan-1', enteredOn, ArrearsBucket.OneToThirtyDays);
    const domainEvents = new InMemoryDomainEventDispatcher();

    domainEvents.on(LoanArrearsBucketEntered.eventName, () => handler.handle(event), { phase: 'after-commit' });

    await expect(
      new InMemoryUnitOfWork().run(() => announceDomainEvents([event], domainEvents)),
    ).resolves.toBeUndefined();

    expect(domainEvents.afterCommitFailures.map((failure) => failure.error)).toHaveLength(1);
  });
});

async function arrangeLoan(): Promise<FakeLoanRepository> {
  const loanRepository = new FakeLoanRepository();

  const loan = aLoan()
    .identifiedBy('loan-1')
    .borrowedBy(Borrower.create('Ada Lovelace', '1 rue de la Paix, 75002 Paris'))
    .build();

  await loanRepository.save(loan);

  return loanRepository;
}
