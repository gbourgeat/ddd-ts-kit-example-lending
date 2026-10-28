import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { submittedApplication } from '$test/e2e/support/credit-application/assessed-application-world';
import {
  appointStaff,
  assessedApplicationOfCustomer,
  confirmRefusal,
  deciderOf,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const contestation = { reason: 'The income I declared is my full income.' };
const approval = { outcome: 'approve', reasons: '', conditions: '', approvedAmountCents: 0 };

const refusal = {
  outcome: 'refuse',
  reasons: 'The register lists the applicant.',
  conditions: '',
  approvedAmountCents: 0,
};

const birthDate = new Date('1980-05-01T00:00:00.000Z');

describe('Contest a decision, end to end', () => {
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
  });

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/contestation', contestation);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who is not the applicant', async () => {
    const stranger = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    expectStatus(await stranger.post('/applications/id-1/contestation', contestation), 403);
  });

  it('refuses a contestation of a file not decided yet, by its code', async () => {
    const { applicationId, customerId } = await submittedApplication(application);
    const applicant = await application.as({ id: customerId, tenantId: 'acme-bank' });

    const response = await applicant.post(`/applications/${applicationId}/contestation`, contestation);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'CONTEST_NOT_DECIDED' });
  });

  it('lets the applicant contest an approval: 204, and a second contestation is refused by its code', async () => {
    await publishDelegationTable(application);

    const { applicationId, customerId } = await assessedApplicationOfCustomer(
      application,
      await appointStaff(application, 'credit-analyst'),
    );

    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, approval), 201);

    const applicant = await application.as({ id: customerId, tenantId: 'acme-bank' });

    expectStatus(await applicant.post(`/applications/${applicationId}/contestation`, contestation), 204);

    const again = await applicant.post(`/applications/${applicationId}/contestation`, contestation);

    expect(again.body).toMatchObject({ code: 'CONTEST_ALREADY_RECORDED' });
  });

  it('lets the applicant contest a refusal the decider confirmed: 204', async () => {
    await publishDelegationTable(application);
    application.incidents.record('Ada Lovelace', birthDate);

    const { applicationId, customerId } = await assessedApplicationOfCustomer(
      application,
      await appointStaff(application, 'credit-analyst'),
    );

    await confirmRefusal(application, applicationId, await appointStaff(application, 'risk-manager'));
    const advisor = await deciderOf(application, 'advisor');

    expectStatus(await advisor.post(`/applications/${applicationId}/decision`, refusal), 201);

    const applicant = await application.as({ id: customerId, tenantId: 'acme-bank' });

    expectStatus(await applicant.post(`/applications/${applicationId}/contestation`, contestation), 204);
  });
});
