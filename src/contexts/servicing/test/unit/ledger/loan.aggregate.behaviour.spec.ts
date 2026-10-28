import { describe, expect, it } from '@jest/globals';
import { given, givenEvents } from '@ddd-ts-kit/testing';
import { Loan } from '@/contexts/servicing/ledger/domain/aggregates/loan.aggregate';
import { LoanClosed } from '@/contexts/servicing/ledger/domain/events/loan-closed.event';
import { LoanPaidOut } from '@/contexts/servicing/ledger/domain/events/loan-paid-out.event';
import { LoanInstalmentDueNoted } from '@/contexts/servicing/ledger/domain/events/loan-instalment-due-noted.event';
import { LoanEarlyRepaymentRecorded } from '@/contexts/servicing/ledger/domain/events/loan-early-repayment-recorded.event';
import { LoanWrittenOff } from '@/contexts/servicing/ledger/domain/events/loan-written-off.event';
import { LoanWriteOffReversed } from '@/contexts/servicing/ledger/domain/events/loan-write-off-reversed.event';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';
import { Money } from '@/shared-kernel/money.vo';

const bornAt = new Date('2026-03-01T00:00:00.000Z');
const closedAt = new Date('2031-03-01T00:00:00.000Z');

describe('A loan paid out to its borrower', () => {
  it('starts its ledger on the instant of its payout', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.toState())
      .thenNoEvent()
      .thenState((loan) => expect(loan.registeredAt).toEqual(bornAt));
  });

  it('records its payout as the fact that opens its ledger, with its identifier and instant', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(bornAt).build();

    expect(loan.pullEvents()).toContainEqual(new LoanPaidOut('loan-1', bornAt, loan.borrower));
  });
});

describe('A loan closed once its ledger is over', () => {
  it('records its closure on the instant it is closed', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [new LoanPaidOut('loan-1', bornAt, aLoan().build().borrower)],
    )
      .when((loan) => loan.close(closedAt))
      .thenEventNames([LoanClosed.eventName])
      .thenState((loan) => expect(loan.closedAt).toEqual(closedAt));
  });

  it('refuses to close a loan that is already closed, and records nothing', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [new LoanPaidOut('loan-1', bornAt), new LoanClosed('loan-1', closedAt)],
    )
      .when((loan) => loan.close(new Date('2031-04-01T00:00:00.000Z')))
      .thenError('LOAN_ALREADY_CLOSED');
  });
});

describe('A loan whose instalments fall due', () => {
  const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');

  it('records each instalment of its schedule that has fallen due, with its number and its due date', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z'));

    expect(loan.pullEvents()).toContainEqual(
      expect.objectContaining({
        number: 1,
        dueOn: new Date('2026-02-10T00:00:00.000Z'),
      }),
    );
  });

  it('records the instalments due on the instant of the run, and no instalment not yet due', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z'));

    expect(loan.pullEvents().filter((event) => event.name === LoanInstalmentDueNoted.eventName)).toHaveLength(2);
  });

  it('records nothing twice when the same run is repeated', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();
    const now = new Date('2026-03-10T00:00:00.000Z');

    loan.computeDueInstalments(now);
    loan.computeDueInstalments(now);

    expect(loan.pullEvents().filter((event) => event.name === LoanInstalmentDueNoted.eventName)).toHaveLength(2);
  });

  it('records only the instalments that fell due since the last run', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(new Date('2026-02-10T00:00:00.000Z'));
    loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z'));

    expect(loan.pullEvents().filter((event) => event.name === LoanInstalmentDueNoted.eventName)).toHaveLength(2);
  });

  it('records no instalment once the loan is closed', () => {
    givenEvents(
      (id, history) => Loan.rehydrate(id, history),
      [new LoanPaidOut('loan-1', bornAt, aLoan().build().borrower), new LoanClosed('loan-1', closedAt)],
    )
      .when((loan) => loan.computeDueInstalments(new Date('2026-03-10T00:00:00.000Z')))
      .thenNoEvent();
  });
});

describe('A loan repaid early', () => {
  const now = new Date('2026-06-10T00:00:00.000Z');

  it('records the capital repaid, leaving the rest outstanding', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.repayEarly(Money.ofCents(40_000), now))
      .thenEventNames([LoanEarlyRepaymentRecorded.eventName])
      .thenState((loan) => expect(loan.outstandingCapital.cents).toBe(60_000));
  });

  it('is closed by the same ledger when the whole outstanding capital is repaid', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.repayEarly(Money.ofCents(100_000), now))
      .thenEventNames([LoanEarlyRepaymentRecorded.eventName, LoanClosed.eventName])
      .thenState((loan) => expect(loan.closedAt).toEqual(now));
  });

  it('refuses a repayment above the outstanding capital, and records nothing', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.repayEarly(Money.ofCents(100_001), now))
      .thenError('EARLY_REPAYMENT_TOO_HIGH');
  });

  it('refuses a repayment of nothing, and records nothing', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.repayEarly(Money.ofCents(0), now))
      .thenError('INVALID_REPAYMENT');
  });
});

describe('A loan written off', () => {
  const writtenOffAt = new Date('2026-06-10T00:00:00.000Z');

  it('records the outstanding capital written off, and the loan ends', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.writeOff(writtenOffAt))
      .thenEventNames([LoanWrittenOff.eventName])
      .thenState((loan) => expect(loan.closedAt).toEqual(writtenOffAt));
  });

  it('refuses a second write-off, since the loan is closed', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => {
        loan.writeOff(writtenOffAt);
        loan.writeOff(writtenOffAt);
      })
      .thenError('LOAN_ALREADY_CLOSED');
  });

  it('is reopened by a reversal, its outstanding capital open again', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => {
        loan.writeOff(writtenOffAt);
        loan.reverseWriteOff(writtenOffAt);
      })
      .thenEventNames([LoanWrittenOff.eventName, LoanWriteOffReversed.eventName])
      .thenState((loan) => expect(loan.closedAt).toBeUndefined());
  });

  it('refuses a reversal of a loan not written off', () => {
    given(aLoan().identifiedBy('loan-1').bornAt(bornAt))
      .when((loan) => loan.reverseWriteOff(writtenOffAt))
      .thenError('LOAN_NOT_WRITTEN_OFF');
  });
});
