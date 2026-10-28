import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { bankTenantId, raisedAlert, withoutRequestId } from '$test/e2e/support/financial-crime/alert-world';

describe('Close alert, hidden from a stranger, end to end', () => {
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

  it('answers a stranger the same refusal for an alert that exists and for one that does not', async () => {
    await raisedAlert(application, 'alert-1');
    const stranger = await application.as({ id: 'stranger', tenantId: bankTenantId });

    const existing = await stranger.post('/alerts/alert-1/closure', { reason: 'Checked with the customer' });

    const unknown = await stranger.post('/alerts/alert-that-does-not-exist/closure', {
      reason: 'Checked with the customer',
    });

    expectStatus(existing, 403);
    expect(unknown.status).toBe(existing.status);
    expect(withoutRequestId(unknown.body)).toEqual(withoutRequestId(existing.body));
  });

  it('leaves the alert open after a stranger tries to close it', async () => {
    await raisedAlert(application, 'alert-1');
    const stranger = await application.as({ id: 'stranger', tenantId: bankTenantId });

    await stranger.post('/alerts/alert-1/closure', { reason: 'Checked with the customer' });

    const row = await application.persistence.database.client().financialCrimeAlert.findUniqueOrThrow({
      where: { id: 'alert-1' },
    });

    expect(row.closedAt).toBeNull();
  });
});
