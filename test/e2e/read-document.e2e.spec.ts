import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import { multipartFile } from '$test/e2e/support/credit-application/multipart-file';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const PDF = '%PDF-1.7\n%%EOF\n';

describe('Read document, end to end', () => {
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

  /** A customer submits an application and attaches a payslip to it; the broker who brought it is related to it. */
  async function submitApplicationWithPayslip(): Promise<{ applicationId: string; documentKey: string }> {
    await application.relate({ object: 'customer:customer-1', relation: 'self', subject: 'user:customer-1' });
    const applicant = await application.as({ id: 'customer-1', tenantId: 'bank-1' });
    const submitted = expectStatus(await applicant.post('/applications', request), 201);
    const applicationId = (submitted.body as { id: string }).id;

    await application.relate({
      object: `application:${applicationId}`,
      relation: 'customer',
      subject: 'customer:customer-1',
    });

    await application.relate({ object: `application:${applicationId}`, relation: 'broker', subject: 'user:broker-1' });

    const file = multipartFile('payslip.pdf', 'application/pdf', PDF);

    const attached = expectStatus(
      await applicant.post(`/applications/${applicationId}/documents`, file.body, {
        headers: { 'content-type': file.contentType },
      }),
      201,
    );

    return { applicationId, documentKey: (attached.body as { key: string }).key };
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.get('/applications/id-1/documents/key-1');

    expectStatus(response, 401);
  });

  it('answers 403 to a stranger who is not related to the application', async () => {
    const { applicationId, documentKey } = await submitApplicationWithPayslip();
    const stranger = await application.as({ id: 'stranger-1', tenantId: 'bank-1' });

    const response = await stranger.get(`/applications/${applicationId}/documents/${encodeURIComponent(documentKey)}`);

    expectStatus(response, 403);
  });

  it('lets the broker who brought the application read the payslip back: 200, the same bytes and the media type', async () => {
    const { applicationId, documentKey } = await submitApplicationWithPayslip();
    const broker = await application.as({ id: 'broker-1', tenantId: 'bank-1' });

    const response = await broker.get(`/applications/${applicationId}/documents/${encodeURIComponent(documentKey)}`);

    expectStatus(response, 200);
    expect(response.headers['content-type']).toContain('application/pdf');
    expect(response.body).toBe(PDF);
  });
});
