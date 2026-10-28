import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { storedEventsText } from '$test/e2e/support/servicing/paid-out-loan';
import { borrowerOf, publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';

const APPLICATION_ID = 'application-1';

// No route starts "record payout": the integration handler sends its command when credit-application publishes the payout authorisation.
describe('Record payout, end to end', () => {
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

    customerId = await registeredCustomer(await operatorOf(application, 'ada'));
  });

  it('records the loan paid out, with its schedule, and lets its borrower read it', async () => {
    await publishPayoutAuthorised(application, { applicationId: APPLICATION_ID, customerId });
    const borrower = await borrowerOf(application, 'bob', APPLICATION_ID);

    const response = await borrower.get(`/loans/${APPLICATION_ID}`);

    expectStatus(response, 200);

    expect(response.body).toMatchObject({
      loanId: APPLICATION_ID,
      status: 'paid-out',
      principalCents: 100_000,
      annualRateBasisPoints: 500,
      durationMonths: 12,
    });

    expect((response.body as { instalmentsCents: number[] }).instalmentsCents).toHaveLength(12);
  });

  it('never answers the personal data of the borrower with the loan', async () => {
    await publishPayoutAuthorised(application, { applicationId: APPLICATION_ID, customerId });
    const borrower = await borrowerOf(application, 'bob', APPLICATION_ID);

    const response = await borrower.get(`/loans/${APPLICATION_ID}`);

    expect(JSON.stringify(response.body)).not.toContain('Ada Lovelace');
  });

  it('keeps the name of the borrower sealed in the ledger, never in clear', async () => {
    await publishPayoutAuthorised(application, { applicationId: APPLICATION_ID, customerId });

    expect(await storedEventsText(application)).not.toContain('Ada Lovelace');
  });

  it('creates no second loan when the same payout authorisation is delivered again', async () => {
    await publishPayoutAuthorised(application, { applicationId: APPLICATION_ID, customerId });
    await publishPayoutAuthorised(application, { applicationId: APPLICATION_ID, customerId });

    const paidOutEvents = (await storedEventsText(application)).split('servicing.loan.paid-out').length - 1;

    expect(paidOutEvents).toBe(1);
  });
});
