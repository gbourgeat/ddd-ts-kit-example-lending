import { describe, expect, it } from '@jest/globals';
import { DaysPastDueService } from '@/contexts/servicing/ledger/domain/services/days-past-due.service';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const firstInstalmentDueOn = new Date('2026-02-10T00:00:00.000Z');
const runOnTheTenthOfMarch = new Date('2026-03-10T00:00:00.000Z');

describe('DaysPastDueService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new DaysPastDueService())).toEqual([]);
  });

  it('counts the whole days since the unpaid instalment fell due', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(firstInstalmentDueOn);
    loan.markUnpaid(1, firstInstalmentDueOn);

    const tenDaysLater = new Date('2026-02-20T00:00:00.000Z');

    expect(new DaysPastDueService().of(loan.toState(), tenDaysLater)).toBe(10);
  });

  it('counts no day past due while no instalment is unpaid', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(firstInstalmentDueOn);

    expect(new DaysPastDueService().of(loan.toState(), runOnTheTenthOfMarch)).toBe(0);
  });

  it('counts from the oldest of the unpaid instalments', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(runOnTheTenthOfMarch);
    loan.markUnpaid(1, runOnTheTenthOfMarch);
    loan.markUnpaid(2, runOnTheTenthOfMarch);

    const tenDaysAfterTheSecond = new Date('2026-03-20T00:00:00.000Z');

    expect(new DaysPastDueService().of(loan.toState(), tenDaysAfterTheSecond)).toBe(38);
  });
});
