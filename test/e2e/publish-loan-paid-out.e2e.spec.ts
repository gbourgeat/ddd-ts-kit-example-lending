import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { collectEvents } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { publishPayoutAuthorised } from '$test/e2e/support/servicing/payout-authorised';

const loanPaidOut = 'servicing.loan.paid-out';

describe('Publish the loan paid out, end to end', () => {
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

  it('publishes the loan under the identifier of its application once credit-application authorised the payout', async () => {
    const customerId = await registeredCustomer(await operatorOf(application, 'ada'));
    const received = collectEvents(application.events, [loanPaidOut]);

    await publishPayoutAuthorised(application, { applicationId: 'application-9', customerId });
    received.stop();

    expect(received.received(loanPaidOut).map((event) => event.payload)).toEqual([{ loanId: 'application-9' }]);
  });
});
