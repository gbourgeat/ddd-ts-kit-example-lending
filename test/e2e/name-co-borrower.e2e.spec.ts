import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { expectSpanTree, installTestTracing } from '@ddd-ts-kit/tracing/testing';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { storyOf } from '$test/e2e/support/story-of';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const coBorrower = { coBorrowerId: 'customer-2' };

describe('Name co borrower, end to end', () => {
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

  /** A customer submits an application, and the application is related to her as its customer. */
  async function submitApplication(): Promise<{
    applicationId: string;
    applicant: Awaited<ReturnType<RunningApplication['as']>>;
  }> {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const applicant = await application.as({ id: 'customer-1', tenantId: 'bank-1' });
    const submitted = expectStatus(await applicant.post('/applications', request), 201);
    const applicationId = (submitted.body as { id: string }).id;

    await application.relate({
      object: `application:${applicationId}`,
      relation: 'customer',
      subject: 'customer:customer-1',
    });

    return { applicationId, applicant };
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/co-borrowers', coBorrower);

    expectStatus(response, 401);
  });

  it('answers 403 to a stranger who is not the applicant of the application', async () => {
    const { applicationId } = await submitApplication();
    const stranger = await application.as({ id: 'stranger-1', tenantId: 'bank-1' });

    const response = await stranger.post(`/applications/${applicationId}/co-borrowers`, coBorrower);

    expect(response.status).toBe(403);
  });

  it('lets the applicant name a co-borrower on her application: 2xx, and the application identifier', async () => {
    const { applicationId, applicant } = await submitApplication();

    const response = await applicant.post(`/applications/${applicationId}/co-borrowers`, coBorrower);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: applicationId });
  });

  it('lets the applicant name a second co-borrower after the first, on the same application: 2xx', async () => {
    const { applicationId, applicant } = await submitApplication();

    expectStatus(await applicant.post(`/applications/${applicationId}/co-borrowers`, coBorrower), 201);

    const response = await applicant.post(`/applications/${applicationId}/co-borrowers`, {
      coBorrowerId: 'customer-3',
    });

    expect(response.status).toBe(201);
  });

  it('is one trace: the request, the use case and what it saves', async () => {
    const { applicationId, applicant } = await submitApplication();

    // The relay of the submission ends before the trace starts, so that its spans are not the request's.
    await application.settled();

    const trace = await tracing.traceOf(async () => {
      expectStatus(await applicant.post(`/applications/${applicationId}/co-borrowers`, coBorrower), 201);
    });

    // Exact on names and structure. The announced fact comes after the save, under `unit-of-work before-commit`.
    expectSpanTree(storyOf(trace), [
      {
        name: 'POST /applications/:id/co-borrowers',
        kind: 'SERVER',
        children: [
          {
            name: 'command NameCoBorrowerCommand',
            children: [
              { name: 'repository CreditApplicationRepository.findById' },
              { name: 'repository CreditApplicationRepository.save' },
              {
                name: 'unit-of-work before-commit',
                children: [{ name: 'domain-event credit-application.credit-application.co-borrower-named' }],
              },
            ],
          },
        ],
      },
    ]);
  });

  it('refuses to name a co-borrower on an application that does not exist, with its code', async () => {
    const { applicant } = await submitApplication();

    await application.relate({
      object: 'application:unknown-application',
      relation: 'customer',
      subject: 'customer:customer-1',
    });

    const response = await applicant.post('/applications/unknown-application/co-borrowers', coBorrower);

    expect(response.body).toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });
});
