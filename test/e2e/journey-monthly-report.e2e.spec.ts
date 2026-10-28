import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  publishDecided,
  publishSubmitted,
  type DecidedApplication,
  type SubmittedApplication,
} from '$test/e2e/support/reporting/credit-application-events';
import { publishBucketEntered, publishPayout } from '$test/e2e/support/reporting/reporting-events';
import { readMonthlyReport, reportReaderOf, type MonthlyReportBranch } from '$test/e2e/support/reporting/report-reader';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';

const MARCH = '2026-03';
const MARCH_INSTANT = '2026-03-10T09:00:00.000Z';

const submitted: SubmittedApplication[] = [
  submittedOn('app-1', 'branch-1', 1000),
  submittedOn('app-2', 'branch-1', 2500),
  submittedOn('app-3', 'branch-1', 500),
  submittedOn('app-4', 'branch-2', 700),
];

const decided: DecidedApplication[] = [
  decidedOn({ applicationId: 'app-1', branchId: 'branch-1', outcome: 'approve', exception: false }),
  decidedOn({ applicationId: 'app-2', branchId: 'branch-1', outcome: 'approve-with-conditions', exception: false }),
  decidedOn({ applicationId: 'app-3', branchId: 'branch-1', outcome: 'refuse', exception: true }),
  decidedOn({ applicationId: 'app-4', branchId: 'branch-2', outcome: 'refuse', exception: false }),
];

describe('Monthly report of each branch, end to end', () => {
  let application: RunningApplication;
  let customerId: string;

  beforeAll(async () => {
    application = await startApplication();
    await application.reset();
    await openBank(application, BANK_TENANT);
    customerId = await registeredCustomer(await operatorOf(application, 'ada'));
  });

  afterAll(async () => {
    await application.close();
  });

  it('shows, per branch, the applications, the approval rate, the share of exceptions and the portfolio at risk of the month', async () => {
    await publishSubmitted(application, submitted);
    await publishDecided(application, decided);

    await publishPayout(application, {
      applicationId: 'app-1',
      customerId,
      branchId: 'branch-1',
      amountCents: 100_000,
    });

    await publishBucketEntered(application, { eventId: 'bucket-1', loanId: 'app-1', bucket: 'OverNinetyDays' });

    const branches = await readMonthlyReport(await reportReaderOf(application, 'ada'), MARCH);

    expect(branches).toEqual(expectedFigures());
  });

  it('refuses a month that is not written YYYY-MM with 422', async () => {
    const reader = await reportReaderOf(application, 'ada');

    expectStatus(await reader.get('/reports/monthly?month=2026-13'), 422);
  });

  it('refuses the monthly report to a caller who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.get(`/reports/monthly?month=${MARCH}`), 403);
  });
});

function submittedOn(applicationId: string, branchId: string, requestedAmountCents: number): SubmittedApplication {
  return {
    eventId: `submitted-${applicationId}`,
    applicationId,
    branchId,
    requestedAmountCents,
    occurredAt: MARCH_INSTANT,
  };
}

function decidedOn(decision: Omit<DecidedApplication, 'eventId' | 'occurredAt'>): DecidedApplication {
  return {
    ...decision,
    eventId: `decided-${decision.applicationId}`,
    occurredAt: MARCH_INSTANT,
  };
}

/** The figures of March: branch 1 brought in three applications and decided three, branch 2 one of each. */
function expectedFigures(): MonthlyReportBranch[] {
  return [
    {
      branchId: 'branch-1',
      month: MARCH,
      applicationCount: 3,
      applicationAmountCents: 4000,
      decisionCount: 3,
      approvalCount: 2,
      exceptionCount: 1,
      approvalRateBasisPoints: 6666,
      exceptionShareBasisPoints: 3333,
      portfolioAtRiskBasisPoints: 10_000,
    },
    {
      branchId: 'branch-2',
      month: MARCH,
      applicationCount: 1,
      applicationAmountCents: 700,
      decisionCount: 1,
      approvalCount: 0,
      exceptionCount: 0,
      approvalRateBasisPoints: 0,
      exceptionShareBasisPoints: 0,
      portfolioAtRiskBasisPoints: 0,
    },
  ];
}
