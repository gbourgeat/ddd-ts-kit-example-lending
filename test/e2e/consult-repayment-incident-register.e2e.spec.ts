import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import { startApplication, type RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

/** The applicant is the borrower of the application: the person who submits it. */
const borrowerBody = { ...aPersonBody('12AB34567'), name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' };
const coBorrowerBody = { ...aPersonBody('98ZY76543'), name: 'Charles Babbage', birthDate: '1791-12-26T00:00:00.000Z' };

describe('Consult the repayment incident register, end to end', () => {
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

  /** Identifies the borrower and a co-borrower; the borrower submits an application and names the co-borrower on it. */
  async function applicationWithCoBorrower(): Promise<{
    applicationId: string;
    borrowerId: string;
    coBorrowerId: string;
  }> {
    const operator = await operatorOf(application, 'ada');
    const borrowerId = (expectStatus(await operator.post('/customers', borrowerBody), 201).body as { id: string }).id;

    const coBorrowerId = (expectStatus(await operator.post('/customers', coBorrowerBody), 201).body as { id: string })
      .id;

    await application.relate({ object: `customer:${borrowerId}`, relation: 'self', subject: `user:${borrowerId}` });
    const applicant: HttpClient = await application.as({ id: borrowerId, tenantId: 'acme-bank' });
    const submitted = expectStatus(await applicant.post('/applications', request), 201);
    const applicationId = (submitted.body as { id: string }).id;

    await application.relate({
      object: `application:${applicationId}`,
      relation: 'customer',
      subject: `customer:${borrowerId}`,
    });

    expectStatus(await applicant.post(`/applications/${applicationId}/co-borrowers`, { coBorrowerId }), 201);

    return { applicationId, borrowerId, coBorrowerId };
  }

  /** A credit analyst, an operator of the context, who consults the register. */
  async function analyst(): Promise<HttpClient> {
    await application.relate({
      object: 'context:credit-application',
      relation: 'operator',
      subject: 'user:credit-analyst',
    });

    return application.as({ id: 'credit-analyst', tenantId: 'acme-bank' });
  }

  it('answers 401 to a caller who presents no credential', async () => {
    const response = await application.client.post('/applications/id-1/register-consultations', {});

    expectStatus(response, 401);
  });

  it('answers 403 to a stranger who does not operate the context', async () => {
    const { applicationId } = await applicationWithCoBorrower();
    const stranger = await application.as({ id: 'stranger-1', tenantId: 'acme-bank' });

    const response = await stranger.post(`/applications/${applicationId}/register-consultations`, {});

    expect(response.status).toBe(403);
  });

  it('consults the register for the borrower and the co-borrower, and answers the name and birth date of each', async () => {
    const { applicationId, borrowerId, coBorrowerId } = await applicationWithCoBorrower();
    const credit = await analyst();

    const consulted = expectStatus(await credit.post(`/applications/${applicationId}/register-consultations`, {}), 201);

    expect(consulted.body).toMatchObject({
      applicationId,
      parties: expect.arrayContaining([
        { customerId: borrowerId, name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z', listed: false },
        { customerId: coBorrowerId, name: 'Charles Babbage', birthDate: '1791-12-26T00:00:00.000Z', listed: false },
      ]),
    });
  });

  it('refuses to consult the register of an application that does not exist, with its code', async () => {
    const credit = await analyst();

    const response = await credit.post('/applications/unknown-application/register-consultations', {});

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body).toMatchObject({ code: 'UNKNOWN_CREDIT_APPLICATION' });
  });
});
