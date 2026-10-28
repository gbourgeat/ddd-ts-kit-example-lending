import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { bankTenantId, complianceOfficer, raisedAlert } from '$test/e2e/support/financial-crime/alert-world';

describe('List alerts, end to end', () => {
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

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/alerts');

    expectStatus(response, 401);
  });

  it('answers 403 to a signed-in member of staff who is not compliance, whatever the alerts', async () => {
    await raisedAlert(application, 'alert-1');
    const stranger = await application.as({ id: 'stranger', tenantId: bankTenantId });

    const response = await stranger.get('/alerts');

    expectStatus(response, 403);
    expect(response.body).not.toMatchObject({ items: expect.anything() });
  });

  it('lists the alerts of the bank to a compliance officer', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    const listed = expectStatus(await ada.get('/alerts'), 200);

    expect(listed.body).toMatchObject({ items: [{ id: 'alert-1', repaymentReference: 'repayment-of-alert-1' }] });
  });

  it('lists no alert of another bank, even to a compliance officer of this one', async () => {
    await raisedAlert(application, 'alert-other-bank', 'other-bank');
    const ada = await complianceOfficer(application, 'ada');

    const listed = expectStatus(await ada.get('/alerts'), 200);

    expect(listed.body).toMatchObject({ items: [] });
  });

  it('keeps the alerts out of the page of a caller who is refused, by refusing the whole list', async () => {
    await raisedAlert(application, 'alert-1');
    const stranger = await application.as({ id: 'stranger', tenantId: bankTenantId });

    const refused = await stranger.get('/alerts?limit=1');

    expectStatus(refused, 403);
    expect(JSON.stringify(refused.body)).not.toContain('alert-1');
  });
});
