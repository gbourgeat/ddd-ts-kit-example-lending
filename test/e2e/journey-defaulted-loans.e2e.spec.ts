import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { publishPayout, REPORTING_TENANT } from '$test/e2e/support/reporting/reporting-events';
import { publishLoanDefaulted } from '$test/e2e/support/reporting/publish-loan-defaulted';
import { readDefaultedLoans, type DefaultedLoanLine } from '$test/e2e/support/reporting/defaulted-loans-reader';
import { reportReaderOf } from '$test/e2e/support/reporting/report-reader';

describe('Loans in default, for the supervisor, end to end', () => {
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

  it('lists each loan in default with its branch, the amount paid out to it and the instant of its default', async () => {
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

    const loans = await readDefaultedLoans(await reportReaderOf(application, 'ada'));

    expect(loans).toEqual([
      defaultedLine({
        loanId: 'app-1',
        branchId: 'branch-1',
        principalCents: 100_000,
        defaultedAt: '2026-03-05T00:00:00.000Z',
      }),
    ]);
  });

  it('lists a loan once when the same default is delivered twice', async () => {
    await publishPayout(application, {
      customerId,
      applicationId: 'app-1',
      branchId: 'branch-1',
      amountCents: 100_000,
    });

    const declared = { eventId: 'default-1', loanId: 'app-1', occurredAt: '2026-03-05T00:00:00.000Z' };

    await publishLoanDefaulted(application, declared);
    await publishLoanDefaulted(application, declared);

    const loans = await readDefaultedLoans(await reportReaderOf(application, 'ada'));

    expect(loans.map((loan) => loan.loanId)).toEqual(['app-1']);
  });

  it('lists a loan declared in default before its payout once the payout arrives', async () => {
    await publishLoanDefaulted(application, {
      eventId: 'default-3',
      loanId: 'app-3',
      occurredAt: '2026-03-06T00:00:00.000Z',
    });

    const beforePayout = await readDefaultedLoans(await reportReaderOf(application, 'ada'));

    await publishPayout(application, {
      customerId,
      applicationId: 'app-3',
      branchId: 'branch-2',
      amountCents: 200_000,
    });

    const afterPayout = await readDefaultedLoans(await reportReaderOf(application, 'ada'));

    expect(beforePayout).toEqual([]);

    expect(afterPayout).toEqual([
      defaultedLine({
        loanId: 'app-3',
        branchId: 'branch-2',
        principalCents: 200_000,
        defaultedAt: '2026-03-06T00:00:00.000Z',
      }),
    ]);
  });

  it('refuses the list to a caller who is not an operator of reporting with 403', async () => {
    const stranger = await application.as({ id: 'bob', tenantId: REPORTING_TENANT });

    const response = await stranger.get('/reports/defaulted-loans');

    expectStatus(response, 403);
  });
});

/** A loan line of the list as the API answers it. */
function defaultedLine(line: DefaultedLoanLine): DefaultedLoanLine {
  return line;
}
