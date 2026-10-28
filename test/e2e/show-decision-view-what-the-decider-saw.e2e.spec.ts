import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import {
  appointStaff,
  assessedApplicationBy,
  confirmRefusal,
  keepDecisionReads,
  publishDelegationTable,
} from '$test/e2e/support/credit-application/decision-world';

const conditional = {
  outcome: 'approve-with-conditions',
  reasons: '',
  conditions: 'A guarantor, and 48 months.',
  approvedAmountCents: 1_000_000,
};

const refusal = {
  outcome: 'refuse',
  reasons: 'The debt to income ratio is above the policy.',
  conditions: '',
  approvedAmountCents: 0,
};

describe('Show what the decider saw: the decision, the assessment, the register and the review', () => {
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

  it('shows the decision as the file recorded it: the outcome, the decider and their level, the amount approved', async () => {
    const { applicationId, accountId, client } = await decidedApplication(application, conditional, false);

    const response = await client.get(`/applications/${applicationId}/decision-view`);

    expectStatus(response, 200);

    expect(response.body).toMatchObject({
      applicationId,
      decision: {
        outcome: 'approve-with-conditions',
        deciderId: accountId,
        level: 'advisor',
        conditions: 'A guarantor, and 48 months.',
        approvedAmountCents: 1_000_000,
        exception: false,
      },
    });
  });

  it('shows the assessment the decider saw, with its assessor and the outcome it proposed', async () => {
    const { applicationId, assessorId, client } = await decidedApplication(application, conditional, false);

    const response = await client.get(`/applications/${applicationId}/decision-view`);

    expect(response.body).toMatchObject({
      assessment: { assessorId, proposedOutcome: 'approve', band: expect.any(String) },
    });
  });

  it('shows the register answer the decider saw, party by party, with no name of the register', async () => {
    const { applicationId, client } = await decidedApplication(application, conditional, false);

    const response = await client.get(`/applications/${applicationId}/decision-view`);

    expect(response.body).toMatchObject({
      register: { parties: [{ customerId: expect.any(String), listed: false }] },
    });
  });

  it('shows the same view once the current data changed after the decision', async () => {
    const { applicationId, client } = await decidedApplication(application, conditional, false);
    const before = await client.get(`/applications/${applicationId}/decision-view`);

    await publishDelegationTable(application, 900_000);
    const after = await client.get(`/applications/${applicationId}/decision-view`);

    expect(after.body).toEqual(before.body);
  });

  // Last on purpose: the simulated register keeps the person it lists after a reset, so a listed applicant would
  // propose a refusal in every test after this one.
  it('shows the refusal review the decider saw, with its reviewer and its conclusion', async () => {
    const assessorId = await appointStaff(application, 'credit-analyst');
    const applicationId = await assessedApplicationBy(application, true, assessorId);
    const reviewerId = await appointStaff(application, 'credit-analyst');

    await confirmRefusal(application, applicationId, reviewerId);
    const { client } = await decidingAdvisorOf(application);

    expectStatus(await client.post(`/applications/${applicationId}/decision`, refusal), 201);
    await application.settled();

    const response = await client.get(`/applications/${applicationId}/decision-view`);

    expect(response.body).toMatchObject({
      decision: { outcome: 'refuse' },
      refusalReview: { reviewerId, conclusion: 'confirm' },
    });
  });
});

/** A member of staff appointed as an advisor, signed in as the staff member: a decider, with the account it signs in with. */
async function decidingAdvisorOf(application: RunningApplication): Promise<{ accountId: string; client: HttpClient }> {
  const accountId = await appointStaff(application, 'advisor');

  return { accountId, client: await application.as({ id: accountId, tenantId: 'acme-bank' }) };
}

/** An application assessed by an analyst and decided by an advisor, as the file records it: the decider's client is returned with it. */
async function decidedApplication(
  application: RunningApplication,
  decision: object,
  listed: boolean,
): Promise<{ applicationId: string; assessorId: string; accountId: string; client: HttpClient }> {
  const assessorId = await appointStaff(application, 'credit-analyst');
  const applicationId = await assessedApplicationBy(application, listed, assessorId);
  const { accountId, client } = await decidingAdvisorOf(application);

  expectStatus(await client.post(`/applications/${applicationId}/decision`, decision), 201);
  await application.settled();

  return { applicationId, assessorId, accountId, client };
}
