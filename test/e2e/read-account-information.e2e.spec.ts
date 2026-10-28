import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import {
  startDocumentEnvironment,
  type DocumentEnvironment,
} from '$test/e2e/support/credit-application/document-environment';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

describe('Read account information, end to end', () => {
  let application: DocumentEnvironment;

  beforeAll(async () => {
    application = await startDocumentEnvironment();
  });

  afterAll(async () => {
    await application.close();
  });

  beforeEach(async () => {
    await application.reset();
  });

  /** A customer submits an application, which she owns: the applicant of the file. */
  async function submitApplication(): Promise<{
    applicationId: string;
    applicant: Awaited<ReturnType<DocumentEnvironment['as']>>;
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

  it('stores the income and expenses read from the accounts as a document of the file, once the applicant consented: 201', async () => {
    const { applicationId, applicant } = await submitApplication();

    expectStatus(await applicant.post(`/applications/${applicationId}/consent`, {}), 201);

    const response = await applicant.post(`/applications/${applicationId}/account-information`, {});

    expectStatus(response, 201);

    const [key] = application.storage.keys();
    const stored = await application.storage.get(key ?? '');

    expect(application.storage.keys()).toHaveLength(1);
    expect(stored?.metadata).toMatchObject({ mediaType: 'application/json' });

    const chunks = (await stored?.stream.toArray()) ?? [];

    expect(JSON.parse(Buffer.concat(chunks).toString('utf8'))).toEqual({
      monthlyIncomeInCents: 250_000,
      monthlyExpensesInCents: 90_000,
    });
  });

  it('refuses to read the accounts without the applicant consent, by its code, and stores nothing', async () => {
    const { applicationId, applicant } = await submitApplication();

    const response = await applicant.post(`/applications/${applicationId}/account-information`, {});

    expect(response.body).toMatchObject({ code: 'MISSING_ACCOUNT_CONSENT' });
    expect(application.storage.keys()).toEqual([]);
  });
});
