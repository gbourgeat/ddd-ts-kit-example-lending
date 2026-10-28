import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { BANK_TENANT, openBank } from '$test/e2e/support/servicing/bank';
import { publishBucketEntered, publishPayout, REPORTING_TENANT } from '$test/e2e/support/reporting/reporting-events';
import {
  readPortfolioAtRisk,
  reportReaderOf,
  type PortfolioAtRiskBranch,
} from '$test/e2e/support/reporting/report-reader';

describe('Share of each branch at risk, end to end', () => {
  let application: RunningApplication;
  let customerId: string;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    customerId = await setUpBank(application);
  });

  it('shows, per branch, the amount paid out, each arrears bucket and the share at risk in basis points', async () => {
    await payOutTwoBranches(application, customerId);

    const branches = await readPortfolioAtRisk(await reportReaderOf(application, 'ada'));

    expect(branches).toEqual([
      branchLine('branch-1', {
        paidOutCents: 400_000,
        oneToThirtyDaysCents: 300_000,
        thirtyOneToSixtyDaysCents: 100_000,
        atRiskCents: 100_000,
        portfolioAtRiskBasisPoints: 2500,
      }),
      branchLine('branch-2', {
        paidOutCents: 300_000,
        sixtyOneToNinetyDaysCents: 100_000,
        atRiskCents: 100_000,
        portfolioAtRiskBasisPoints: 3333,
      }),
    ]);
  });

  it('counts a loan once when the same bucket event is delivered twice', async () => {
    await payOut(application, { customerId, applicationId: 'app-1', branchId: 'branch-1', amountCents: 100_000 });
    await publishBucketEntered(application, { eventId: 'bucket-1', loanId: 'app-1', bucket: 'OverNinetyDays' });
    await publishBucketEntered(application, { eventId: 'bucket-1', loanId: 'app-1', bucket: 'OverNinetyDays' });

    const branches = await readPortfolioAtRisk(await reportReaderOf(application, 'ada'));

    expect(branches).toEqual([
      branchLine('branch-1', {
        paidOutCents: 100_000,
        overNinetyDaysCents: 100_000,
        atRiskCents: 100_000,
        portfolioAtRiskBasisPoints: 10_000,
      }),
    ]);
  });
});

describe('Arrears reported before the payout, end to end', () => {
  let application: RunningApplication;
  let customerId: string;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    customerId = await setUpBank(application);
  });

  it('counts a loan whose bucket came before its payout once the payout arrives', async () => {
    await publishBucketEntered(application, { eventId: 'bucket-5', loanId: 'app-5', bucket: 'SixtyOneToNinetyDays' });
    const beforePayout = await readPortfolioAtRisk(await reportReaderOf(application, 'ada'));

    await payOut(application, { customerId, applicationId: 'app-5', branchId: 'branch-2', amountCents: 200_000 });
    const afterPayout = await readPortfolioAtRisk(await reportReaderOf(application, 'ada'));

    expect(beforePayout).toEqual([]);

    expect(afterPayout).toEqual([
      branchLine('branch-2', {
        paidOutCents: 200_000,
        sixtyOneToNinetyDaysCents: 200_000,
        atRiskCents: 200_000,
        portfolioAtRiskBasisPoints: 10_000,
      }),
    ]);
  });

  it('refuses the report to a caller who is not an operator of reporting with 403', async () => {
    const stranger = await application.as({ id: 'bob', tenantId: REPORTING_TENANT });

    const response = await stranger.get('/reports/portfolio-at-risk');

    expectStatus(response, 403);
  });
});

/** The payout of one loan: the customer who borrows, the application it was paid out for, the branch and the amount in cents. */
interface Payout {
  readonly customerId: string;
  readonly applicationId: string;
  readonly branchId: string;
  readonly amountCents: number;
}

/** Opens the bank and registers the customer who borrows, as the payouts of the specs name them. */
async function setUpBank(application: RunningApplication): Promise<string> {
  await application.reset();
  await openBank(application, BANK_TENANT);

  return registeredCustomer(await operatorOf(application, 'ada'));
}

/** Pays out one loan, as credit-application authorises it, and settles the work it starts. */
async function payOut(application: RunningApplication, payout: Payout): Promise<void> {
  await publishPayout(application, payout);
}

/** Two loans on branch-1 and two on branch-2, with a bucket for three of them; the fourth loan of branch-2 is performing. */
async function payOutTwoBranches(application: RunningApplication, customerId: string): Promise<void> {
  await payOut(application, { customerId, applicationId: 'app-1', branchId: 'branch-1', amountCents: 100_000 });
  await payOut(application, { customerId, applicationId: 'app-2', branchId: 'branch-1', amountCents: 300_000 });
  await payOut(application, { customerId, applicationId: 'app-3', branchId: 'branch-2', amountCents: 200_000 });
  await payOut(application, { customerId, applicationId: 'app-4', branchId: 'branch-2', amountCents: 100_000 });
  await publishBucketEntered(application, { eventId: 'bucket-1', loanId: 'app-1', bucket: 'ThirtyOneToSixtyDays' });
  await publishBucketEntered(application, { eventId: 'bucket-2', loanId: 'app-2', bucket: 'OneToThirtyDays' });
  await publishBucketEntered(application, { eventId: 'bucket-4', loanId: 'app-4', bucket: 'SixtyOneToNinetyDays' });
}

/** A branch line of the report: the amounts not given are zero, and the share is the one of the amounts given. */
function branchLine(
  branchId: string,
  amounts: Pick<PortfolioAtRiskBranch, 'paidOutCents'> & Partial<PortfolioAtRiskBranch>,
): PortfolioAtRiskBranch {
  return {
    branchId,
    oneToThirtyDaysCents: 0,
    thirtyOneToSixtyDaysCents: 0,
    sixtyOneToNinetyDaysCents: 0,
    overNinetyDaysCents: 0,
    atRiskCents: 0,
    portfolioAtRiskBasisPoints: 0,
    ...amounts,
  };
}
