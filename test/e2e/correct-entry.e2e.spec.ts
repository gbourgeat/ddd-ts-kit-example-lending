import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const guarantor = { guarantorId: 'customer-4' };
const reason = { reason: 'The guarantor was named by mistake' };

describe('Correct entry, end to end', () => {
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

  /** A customer submits an application (entry 1), and names a guarantor on it (entry 2). */
  async function submitApplicationWithGuarantor(): Promise<{
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

    expectStatus(await applicant.post(`/applications/${applicationId}/guarantors`, guarantor), 201);

    return { applicationId, applicant };
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/corrections', {
      entryId: 'id-1#2',
      ...reason,
    });

    expectStatus(response, 401);
  });

  it('lets the applicant correct an entry of her file, naming it and saying why: 201, and the application identifier', async () => {
    const { applicationId, applicant } = await submitApplicationWithGuarantor();

    const response = await applicant.post(`/applications/${applicationId}/corrections`, {
      entryId: `${applicationId}#2`,
      ...reason,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ id: applicationId });
  });

  it('refuses a second correction of the same entry with CORRECTION_ALREADY_RECORDED', async () => {
    const { applicationId, applicant } = await submitApplicationWithGuarantor();
    const correction = { entryId: `${applicationId}#2`, ...reason };

    expectStatus(await applicant.post(`/applications/${applicationId}/corrections`, correction), 201);

    const response = await applicant.post(`/applications/${applicationId}/corrections`, correction);

    expect(response.body).toMatchObject({ code: 'CORRECTION_ALREADY_RECORDED' });
  });

  it('refuses to correct an application that does not exist, with its code', async () => {
    const { applicant } = await submitApplicationWithGuarantor();

    await application.relate({
      object: 'application:unknown-application',
      relation: 'customer',
      subject: 'customer:customer-1',
    });

    const response = await applicant.post('/applications/unknown-application/corrections', {
      entryId: 'unknown-application#2',
      ...reason,
    });

    expect(response.body).toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });
});
