import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  appointStaff,
  assessedApplicationBy,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

describe('Show what the decider saw, who may read it and what it refuses', () => {
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
    await keepDecisionReads(application);
    await publishDelegationTable(application);
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/applications/id-1/decision-view');

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold application.decide', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.get('/applications/id-1/decision-view');

    expectStatus(response, 403);
  });

  it('refuses to show the decision of an application that does not exist, by its code', async () => {
    const { client } = await decidingAdvisorOf(application);

    const response = await client.get('/applications/unknown-application/decision-view');

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });

  it('refuses to show a decision an application does not have yet, by its code', async () => {
    const applicationId = await assessedApplicationBy(
      application,
      false,
      await appointStaff(application, 'credit-analyst'),
    );

    const { client } = await decidingAdvisorOf(application);

    const response = await client.get(`/applications/${applicationId}/decision-view`);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NOT_DECIDED' });
  });
});

/** A member of staff appointed as an advisor, signed in as the staff member: a decider, with the account it signs in with. */
async function decidingAdvisorOf(application: RunningApplication): Promise<{ accountId: string; client: HttpClient }> {
  const accountId = await appointStaff(application, 'advisor');

  return { accountId, client: await application.as({ id: accountId, tenantId: 'acme-bank' }) };
}
