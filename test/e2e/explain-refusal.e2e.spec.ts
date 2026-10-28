import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { advisedApplication, advisorClient } from '$test/e2e/support/credit-application/access-explanation-world';

describe('Explain refusal, end to end', () => {
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
    const response = await application.client.get('/applications/id-1/access-explanation');

    expectStatus(response, 401);
  });

  it('refuses a stranger with the code APPLICATION_NOT_VISIBLE, 403', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.get('/applications/id-1/access-explanation');

    expectStatus(response, 422);
    expect(response.body).toMatchObject({ code: 'APPLICATION_NOT_VISIBLE' });
  });

  it('answers the advisor of the customer, who may read the application, with the outcome visible and no content', async () => {
    const { applicationId, advisorId } = await advisedApplication(application);
    const advisor = await advisorClient(application, advisorId);

    const response = await advisor.get(`/applications/${applicationId}/access-explanation`);

    expect(expectStatus(response, 200).body).toEqual({ outcome: 'visible' });
  });
});
