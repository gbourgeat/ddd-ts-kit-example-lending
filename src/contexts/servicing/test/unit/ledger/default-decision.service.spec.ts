import { describe, expect, it } from '@jest/globals';
import { DefaultDecisionService } from '@/contexts/servicing/ledger/domain/services/default-decision.service';
import { aLoan } from '@/contexts/servicing/test/builders/loan.builder';

const paidOutOnTheTenthOfJanuary = new Date('2026-01-10T00:00:00.000Z');
const firstInstalmentDueOn = new Date('2026-02-10T00:00:00.000Z');

describe('DefaultDecisionService', () => {
  it('holds no state of its own', () => {
    expect(Object.keys(new DefaultDecisionService())).toEqual([]);
  });

  it('declares the default of a loan 90 days past due', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(firstInstalmentDueOn);
    loan.markUnpaid(1, firstInstalmentDueOn);

    const ninetyDaysLater = new Date('2026-05-11T00:00:00.000Z');

    expect(new DefaultDecisionService().isDeclaredAt(loan.toState(), ninetyDaysLater)).toBe(true);
  });

  it('declares no default for a loan 89 days past due', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(firstInstalmentDueOn);
    loan.markUnpaid(1, firstInstalmentDueOn);

    const eightyNineDaysLater = new Date('2026-05-10T00:00:00.000Z');

    expect(new DefaultDecisionService().isDeclaredAt(loan.toState(), eightyNineDaysLater)).toBe(false);
  });

  it('declares no default for a closed loan', () => {
    const loan = aLoan().identifiedBy('loan-1').bornAt(paidOutOnTheTenthOfJanuary).build();

    loan.computeDueInstalments(firstInstalmentDueOn);
    loan.markUnpaid(1, firstInstalmentDueOn);
    loan.close(new Date('2026-03-01T00:00:00.000Z'));

    const ninetyDaysLater = new Date('2026-05-11T00:00:00.000Z');

    expect(new DefaultDecisionService().isDeclaredAt(loan.toState(), ninetyDaysLater)).toBe(false);
  });
});
