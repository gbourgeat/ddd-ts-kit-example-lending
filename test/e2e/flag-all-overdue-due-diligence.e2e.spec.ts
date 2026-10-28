import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  flaggedOverdueOn,
  operatorAt,
  refreshedCustomer,
} from '$test/e2e/support/customer-due-diligence/overdue-flags';

/** The day both customers are refreshed: one a high risk, due one year on; one a low risk, due five years on. */
const REFRESHED_ON = new Date('2026-10-28T08:00:00.000Z');

/** The nightly job asks on this day, for the due diligences that fell due before it. */
const NIGHT = '2028-01-01T08:00:00.000Z';

/** The system actors of branch-network whose relationships the reset of the database empties. */
const branchNetworkSystemActors = [
  'system:system:OpenPortfolioForAdvisorEventHandler',
  'system:system:branch-network.assign-identified-customer',
];

describe('Flag all overdue due diligence, end to end', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();

    for (const subject of branchNetworkSystemActors) {
      await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
    }
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/due-diligence/flag-overdue', { dueBefore: NIGHT });

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger = await application.as({ id: 'stranger' });

    const response = await stranger.post('/due-diligence/flag-overdue', { dueBefore: NIGHT });

    expectStatus(response, 403);
  });

  it('flags the overdue due diligence of a customer and leaves a current one unflagged', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const overdueCustomerId = await refreshedCustomer(operator, 'high');
    const currentCustomerId = await refreshedCustomer(operator, 'low');
    const night = await operatorAt(application, new Date(NIGHT));

    expectStatus(await night.post('/due-diligence/flag-overdue', { dueBefore: NIGHT }), 204);

    expect(await flaggedOverdueOn(night, overdueCustomerId)).toBe(NIGHT);
    expect(await flaggedOverdueOn(night, currentCustomerId)).toBeUndefined();
  });

  it('refuses an instant that is not an ISO date with 422, and flags nothing', async () => {
    const operator = await operatorAt(application, REFRESHED_ON);
    const customerId = await refreshedCustomer(operator, 'high');
    const night = await operatorAt(application, new Date(NIGHT));

    expectStatus(await night.post('/due-diligence/flag-overdue', { dueBefore: 'tomorrow' }), 422);

    expect(await flaggedOverdueOn(night, customerId)).toBeUndefined();
  });
});
