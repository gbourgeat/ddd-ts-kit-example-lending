import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { appointStaff, assessedApplicationOfCustomer } from '$test/e2e/support/credit-application/decision-world';

const birthDate = new Date('1980-05-01T00:00:00.000Z');

describe('Ask for a human review of a refusal, end to end', () => {
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
    const response = await application.client.post('/applications/id-1/human-review', {});

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who is not the applicant', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post('/applications/id-1/human-review', {}), 403);
  });

  // The register keeps the incident of the test below: the approval comes first, while nobody is listed.
  it('refuses a request on an approval, which has no refusal to review, by its code', async () => {
    const { applicationId, customerId } = await assessedApplicationOfCustomer(
      application,
      await appointStaff(application, 'credit-analyst'),
    );

    const applicant = await application.as({ id: customerId, tenantId: 'acme-bank' });

    const response = await applicant.post(`/applications/${applicationId}/human-review`, {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'HUMAN_REVIEW_NOT_AVAILABLE' });
  });

  it('lets the applicant ask for a human review of the refusal the assessment proposed: 204', async () => {
    application.incidents.record('Ada Lovelace', birthDate);

    const { applicationId, customerId } = await assessedApplicationOfCustomer(
      application,
      await appointStaff(application, 'credit-analyst'),
    );

    const applicant = await application.as({ id: customerId, tenantId: 'acme-bank' });

    expectStatus(await applicant.post(`/applications/${applicationId}/human-review`, {}), 204);
  });
});
