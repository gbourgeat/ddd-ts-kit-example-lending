import { describe, expect, it } from '@jest/globals';
import { summariseMonthlyReport } from '@/contexts/reporting/application/read-model/summarise-monthly-report';

const MARCH = '2026-03';

describe('Monthly report of a month, per branch', () => {
  it('sums the applications of a branch, and its approvals, exceptions and rates, in integers', () => {
    const [line] = summariseMonthlyReport({
      month: MARCH,
      applications: [applicationsOf('branch-1', 2, 3500)],
      decisions: [decisionsOf('branch-1', { decisions: 3, approvals: 1, exceptions: 1 })],
      portfolio: [],
    });

    expect(line).toMatchObject({
      branchId: 'branch-1',
      month: MARCH,
      applicationCount: 2,
      applicationAmountCents: 3500,
      decisionCount: 3,
      approvalCount: 1,
      exceptionCount: 1,
      approvalRateBasisPoints: 3333,
      exceptionShareBasisPoints: 3333,
    });
  });

  it('gives zero rates to a branch with no decision, and no portfolio at risk it does not hold', () => {
    const [line] = summariseMonthlyReport({
      month: MARCH,
      applications: [applicationsOf('branch-1', 1, 900)],
      decisions: [],
      portfolio: [],
    });

    expect(line).toMatchObject({
      decisionCount: 0,
      approvalRateBasisPoints: 0,
      exceptionShareBasisPoints: 0,
      portfolioAtRiskBasisPoints: 0,
    });
  });

  it('attaches the portfolio at risk of the branch, and lists the branches sorted', () => {
    const lines = summariseMonthlyReport({
      month: MARCH,
      applications: [],
      decisions: [
        decisionsOf('branch-2', { decisions: 1, approvals: 1, exceptions: 0 }),
        decisionsOf('branch-1', { decisions: 1, approvals: 0, exceptions: 0 }),
      ],
      portfolio: [portfolioOf('branch-2', 250)],
    });

    expect(lines.map((line) => line.branchId)).toEqual(['branch-1', 'branch-2']);
    expect(lines[0]?.portfolioAtRiskBasisPoints).toBe(0);
    expect(lines[1]?.portfolioAtRiskBasisPoints).toBe(250);
  });
});

function applicationsOf(branchId: string, applicationCount: number, amountCents: number) {
  return { key: `t:${branchId}:${MARCH}`, tenantId: 't', branchId, month: MARCH, applicationCount, amountCents };
}

function decisionsOf(
  branchId: string,
  counts: { readonly decisions: number; readonly approvals: number; readonly exceptions: number },
) {
  return {
    key: `t:${branchId}:${MARCH}`,
    tenantId: 't',
    branchId,
    month: MARCH,
    decisionCount: counts.decisions,
    approvalCount: counts.approvals,
    exceptionCount: counts.exceptions,
  };
}

function portfolioOf(branchId: string, atRiskBasisPoints: number) {
  return {
    branchId,
    paidOutCents: 10_000,
    oneToThirtyDaysCents: 0,
    thirtyOneToSixtyDaysCents: 0,
    sixtyOneToNinetyDaysCents: 0,
    overNinetyDaysCents: 0,
    atRiskCents: 250,
    portfolioAtRiskBasisPoints: atRiskBasisPoints,
  };
}
