import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { publishPayout, REPORTING_TENANT } from '$test/e2e/support/reporting/reporting-events';
import { publishLoanDefaulted } from '$test/e2e/support/reporting/publish-loan-defaulted';
import { reportReaderOf } from '$test/e2e/support/reporting/report-reader';
import { csvLines, getCsv } from '$test/e2e/support/reporting/csv-report-reader';

const HEADER = 'loanId,branchId,principalCents,defaultedAt';

describe('Defaults list for the supervisor, as CSV, end to end', () => {
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

  it('answers text/csv with one header line, then one line per loan in default with its branch, principal and default instant', async () => {
    await publishPayout(application, {
      customerId,
      applicationId: 'app-1',
      branchId: 'branch-1',
      amountCents: 100_000,
    });

    await publishPayout(application, {
      customerId,
      applicationId: 'app-2',
      branchId: 'branch-2',
      amountCents: 250_000,
    });

    await publishLoanDefaulted(application, {
      eventId: 'default-1',
      loanId: 'app-1',
      occurredAt: '2026-03-05T00:00:00.000Z',
    });

    const answer = await getCsv(await reportReaderOf(application, 'ada'), '/reports/defaults');

    expect(answer.status).toBe(200);
    expect(answer.contentType).toContain('text/csv');
    expect(csvLines(answer.text)).toEqual([HEADER, 'app-1,branch-1,100000,2026-03-05T00:00:00.000Z']);
  });

  it('answers the same loans as JSON, as items, when the request asks for application/json', async () => {
    await publishPayout(application, {
      customerId,
      applicationId: 'app-1',
      branchId: 'branch-1',
      amountCents: 100_000,
    });

    await publishLoanDefaulted(application, {
      eventId: 'default-1',
      loanId: 'app-1',
      occurredAt: '2026-03-05T00:00:00.000Z',
    });

    const reader = await reportReaderOf(application, 'ada');

    const response = await reader.get<{ items: unknown[] }>('/reports/defaults', {
      headers: { accept: 'application/json' },
    });

    expect(response.body.items).toEqual([
      {
        loanId: 'app-1',
        branchId: 'branch-1',
        principalCents: 100_000,
        defaultedAt: '2026-03-05T00:00:00.000Z',
      },
    ]);
  });

  it('refuses the CSV defaults list to a caller who is not an operator of reporting with 403', async () => {
    const stranger = await application.as({ id: 'bob', tenantId: REPORTING_TENANT });

    const answer = await getCsv(stranger, '/reports/defaults');

    expect(answer.status).toBe(403);
  });
});
