import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { complianceOfficer } from '$test/e2e/support/financial-crime/alert-world';
import { publishLoanPaymentReceived } from '$test/e2e/support/financial-crime/loan-payment-received';

describe('Watch the repayments of servicing, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  it('raises no alert on an ordinary instalment collected by direct debit', async () => {
    const ada = await complianceOfficer(application, 'ada');

    await publishLoanPaymentReceived(application, {
      eventId: 'payment-received-1',
      loanId: 'loan-1',
      instalmentNumber: 3,
      amountCents: 50_000,
    });

    const listed = expectStatus(await ada.get('/alerts'), 200);

    expect(listed.body).toMatchObject({ items: [] });
  });

  it('raises no alert when the same payment is delivered twice', async () => {
    const ada = await complianceOfficer(application, 'ada');
    const payment = { eventId: 'payment-received-2', loanId: 'loan-2', instalmentNumber: 1, amountCents: 50_000 };

    await publishLoanPaymentReceived(application, payment);
    await publishLoanPaymentReceived(application, payment);

    const listed = expectStatus(await ada.get('/alerts'), 200);

    expect(listed.body).toMatchObject({ items: [] });
  });
});
