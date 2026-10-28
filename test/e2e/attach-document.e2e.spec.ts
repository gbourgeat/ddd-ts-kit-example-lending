import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import {
  startDocumentEnvironment,
  type DocumentEnvironment,
} from '$test/e2e/support/credit-application/document-environment';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const PDF = '%PDF-1.7\n%%EOF\n';
const BOUNDARY = 'ddd-ts-kit-document-boundary';

describe('Attach document, end to end', () => {
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

  it('answers 401 to a caller who presents no credential, and stores nothing', async () => {
    const file = multipartFile('payslip.pdf', 'application/pdf', PDF);

    const response = await application.client.post('/applications/id-1/documents', file.body, {
      headers: { 'content-type': file.contentType },
    });

    expectStatus(response, 401);
    expect(application.storage.keys()).toEqual([]);
  });

  it('lets the applicant attach a payslip to her file: 201, and the content is held by the object store', async () => {
    const { applicationId, applicant } = await submitApplication();
    const file = multipartFile('payslip.pdf', 'application/pdf', PDF);

    const response = await applicant.post(`/applications/${applicationId}/documents`, file.body, {
      headers: { 'content-type': file.contentType },
    });

    expectStatus(response, 201);

    const [key] = application.storage.keys();

    expect(application.storage.keys()).toHaveLength(1);

    expect(await application.storage.stat(key ?? '')).toMatchObject({
      size: PDF.length,
      mediaType: 'application/pdf',
    });
  });
});

/** The body of a multipart request carrying the file under the field `file` the route declares. */
function multipartFile(fileName: string, mediaType: string, content: string): { body: string; contentType: string } {
  const body = [
    `--${BOUNDARY}`,
    `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
    `Content-Type: ${mediaType}`,
    '',
    content,
    `--${BOUNDARY}--`,
    '',
  ].join('\r\n');

  return { body, contentType: `multipart/form-data; boundary=${BOUNDARY}` };
}
