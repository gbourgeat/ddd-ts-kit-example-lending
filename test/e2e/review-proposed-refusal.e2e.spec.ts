import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';
import {
  analystOf,
  applicationWithAccountsAndRegister,
  publishScoringVersion,
} from '$test/e2e/support/credit-application/assessed-application-world';

const birthDate = new Date('1980-05-01T00:00:00.000Z');
const confirmation = { conclusion: 'confirm', reason: 'The register lists a homonym, not the applicant.' };

describe('Review proposed refusal, end to end', () => {
  const tracing = installTestTracing();
  let application: RunningApplication;

  beforeAll(async () => {
    application = await startApplication();
  });

  afterAll(async () => {
    await application.close();
    tracing.uninstall();
  });

  beforeEach(async () => {
    await application.reset();
  });

  /** An application assessed by `assessor`: the assessment proposes a refusal when the register lists the applicant. */
  async function assessedApplication(listed: boolean, assessor: string): Promise<string> {
    if (listed) {
      application.incidents.record('Ada Lovelace', birthDate);
    }

    const applicationId = await applicationWithAccountsAndRegister(application);

    await publishScoringVersion(application);

    const credit = await analystOf(application, assessor);

    expectStatus(await credit.post(`/applications/${applicationId}/assessment`, {}), 201);

    return applicationId;
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/refusal-review', confirmation);

    expectStatus(response, 401);
  });

  it('answers 403 to an actor who does not hold the permission', async () => {
    const stranger: HttpClient = await application.as({ id: 'stranger', tenantId: 'acme-bank' });

    const response = await stranger.post('/applications/id-1/refusal-review', confirmation);

    expectStatus(response, 403);
  });

  it('refuses a review of an assessment that proposed approve, by its code', async () => {
    const applicationId = await assessedApplication(false, 'credit-analyst');
    const reviewer = await analystOf(application, 'second-analyst');

    const response = await reviewer.post(`/applications/${applicationId}/refusal-review`, confirmation);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'NO_REFUSAL_TO_REVIEW' });
  });

  it('records the review of a proposed refusal by a second person, who is not the assessor: 201', async () => {
    const applicationId = await assessedApplication(true, 'credit-analyst');
    const reviewer = await analystOf(application, 'second-analyst');

    const response = await reviewer.post(`/applications/${applicationId}/refusal-review`, confirmation);

    expectStatus(response, 201);
  });

  it('refuses the review by the person who ran the assessment, by its code', async () => {
    const applicationId = await assessedApplication(true, 'credit-analyst');
    const assessor = await analystOf(application, 'credit-analyst');

    const response = await assessor.post(`/applications/${applicationId}/refusal-review`, confirmation);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'REVIEWER_CANNOT_BE_ASSESSOR' });
  });

  it('refuses a second review of the same proposed refusal, by its code', async () => {
    const applicationId = await assessedApplication(true, 'credit-analyst');
    const reviewer = await analystOf(application, 'second-analyst');

    expectStatus(await reviewer.post(`/applications/${applicationId}/refusal-review`, confirmation), 201);

    const response = await reviewer.post(`/applications/${applicationId}/refusal-review`, confirmation);

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'REFUSAL_ALREADY_REVIEWED' });
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const applicationId = await assessedApplication(true, 'credit-analyst');
    const reviewer = await analystOf(application, 'second-analyst');

    const trace = await tracing.traceOf(async () => {
      expectStatus(await reviewer.post(`/applications/${applicationId}/refusal-review`, confirmation), 201);
    });

    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /applications/:id/refusal-review',
        kind: 'SERVER',
        children: [
          {
            name: 'command ReviewProposedRefusalCommand',
            children: [
              { name: 'repository CreditApplicationRepository.findById' },
              { name: 'repository CreditApplicationRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event credit-application.credit-application.refusal-reviewed' }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
