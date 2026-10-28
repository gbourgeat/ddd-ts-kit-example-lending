import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { bankTenantId, complianceOfficer, raisedAlert } from '$test/e2e/support/financial-crime/alert-world';

describe('The audit stream of financial crime, end to end', () => {
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

  const entriesOfFinancialCrime = () =>
    application.persistence.database.client().auditEntry.findMany({ where: { context: 'financial-crime' } });

  it('writes the entries of a financial-crime command to the stream chain and to no other chain', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    expectStatus(await ada.post('/alerts/alert-1/closure', { reason: 'Checked with the customer' }), 201);

    const entries = await entriesOfFinancialCrime();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.chain.startsWith('stream:financial-crime:'))).toBe(true);
  });

  it('keeps the refused attempt of a stranger in the stream too, never in the general chain', async () => {
    await raisedAlert(application, 'alert-1');
    const stranger = await application.as({ id: 'stranger', tenantId: bankTenantId });

    expectStatus(await stranger.post('/alerts/alert-1/closure', { reason: 'Checked with the customer' }), 403);

    const entries = await entriesOfFinancialCrime();

    expect(entries.length).toBeGreaterThan(0);
    expect(entries.every((entry) => entry.chain.startsWith('stream:financial-crime:'))).toBe(true);
  });

  it('leaves no entry about an alert in the chain of the bank', async () => {
    await raisedAlert(application, 'alert-1');
    const ada = await complianceOfficer(application, 'ada');

    expectStatus(await ada.post('/alerts/alert-1/closure', { reason: 'Checked with the customer' }), 201);

    const inGeneralChain = await application.persistence.database.client().auditEntry.findMany({
      where: {
        chain: { not: { startsWith: 'stream:' } },
        OR: [{ action: { contains: 'alert' } }, { resourceType: 'alert' }],
      },
    });

    expect(inGeneralChain).toEqual([]);
  });
});
