import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  publishDecided,
  publishSubmitted,
  type DecidedApplication,
  type SubmittedApplication,
} from '$test/e2e/support/reporting/credit-application-events';
import { publishBucketEntered, publishPayout } from '$test/e2e/support/reporting/reporting-events';
import { reportReaderOf } from '$test/e2e/support/reporting/report-reader';
import { csvLines, getCsv } from '$test/e2e/support/reporting/csv-report-reader';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';

const MARCH = '2026-03';
const MARCH_INSTANT = '2026-03-10T09:00:00.000Z';

const HEADER =
  'branchId,month,applicationCount,applicationAmountCents,decisionCount,approvalCount,exceptionCount,approvalRateBasisPoints,exceptionShareBasisPoints,portfolioAtRiskBasisPoints';

describe('Monthly report of each branch as CSV, end to end', () => {
  let application: RunningApplication;
  let customerId: string;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await openBank(application, BANK_TENANT);
    customerId = await registeredCustomer(await operatorOf(application, 'ada'));
  });

  it('answers text/csv with one header line, then one line per branch with its figures of the month', async () => {
    await publishSubmitted(application, [
      submittedOn('app-1', 'branch-1', 1000),
      submittedOn('app-2', 'branch-1', 2500),
      submittedOn('app-3', 'branch-1', 500),
      submittedOn('app-4', 'branch-2', 700),
    ]);

    await publishDecided(application, [
      decidedOn({ applicationId: 'app-1', branchId: 'branch-1', outcome: 'approve', exception: false }),
      decidedOn({ applicationId: 'app-2', branchId: 'branch-1', outcome: 'approve-with-conditions', exception: false }),
      decidedOn({ applicationId: 'app-3', branchId: 'branch-1', outcome: 'refuse', exception: true }),
      decidedOn({ applicationId: 'app-4', branchId: 'branch-2', outcome: 'refuse', exception: false }),
    ]);

    await publishPayout(application, {
      applicationId: 'app-1',
      customerId,
      branchId: 'branch-1',
      amountCents: 100_000,
    });

    await publishBucketEntered(application, { eventId: 'bucket-1', loanId: 'app-1', bucket: 'OverNinetyDays' });

    const answer = await getCsv(await reportReaderOf(application, 'ada'), `/reports/monthly?month=${MARCH}`);

    expect(answer.status).toBe(200);
    expect(answer.contentType).toContain('text/csv');

    expect(csvLines(answer.text)).toEqual([
      HEADER,
      'branch-1,2026-03,3,4000,3,2,1,6666,3333,10000',
      'branch-2,2026-03,1,700,1,0,0,0,0,0',
    ]);
  });

  it('writes a branch id of free text as one safe cell: quoted when it holds a comma or a quote, a formula neutralised', async () => {
    await publishSubmitted(application, [
      submittedOn('app-5', '=cmd', 300),
      submittedOn('app-6', 'north, "main"', 400),
    ]);

    await publishDecided(application, [
      decidedOn({ applicationId: 'app-5', branchId: '=cmd', outcome: 'approve', exception: false }),
      decidedOn({ applicationId: 'app-6', branchId: 'north, "main"', outcome: 'approve', exception: false }),
    ]);

    const answer = await getCsv(await reportReaderOf(application, 'ada'), `/reports/monthly?month=${MARCH}`);

    expect(csvLines(answer.text).slice(1).sort()).toEqual(
      ["'=cmd,2026-03,1,300,1,1,0,10000,0,0", '"north, ""main""",2026-03,1,400,1,1,0,10000,0,0'].sort(),
    );
  });

  it('answers 406 to a media type the report cannot be written in', async () => {
    const reader = await reportReaderOf(application, 'ada');

    const response = await reader.get(`/reports/monthly?month=${MARCH}`, {
      headers: { accept: 'application/pdf' },
    });

    expectStatus(response, 406);
  });

  it('refuses the CSV report to a caller who does not hold the permission with 403', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const answer = await getCsv(stranger, `/reports/monthly?month=${MARCH}`);

    expect(answer.status).toBe(403);
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
