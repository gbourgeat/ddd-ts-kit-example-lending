import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { aPersonBody, operatorOf } from '$test/e2e/support/customer-due-diligence/customer-files';
import { operatorOf as creditScoringOperatorOf } from '$test/e2e/support/credit-scoring/operator-of';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };
const borrowerBody = { ...aPersonBody('12AB34567'), name: 'Ada Lovelace', birthDate: '1980-05-01T00:00:00.000Z' };
const version = { modelRisk: 'medium', label: '2026.1' };

/** The borrower submits an application, which she owns: the applicant of the file. */
export async function submittedApplication(
  application: RunningApplication,
): Promise<{ applicationId: string; applicant: HttpClient }> {
  const operator = await operatorOf(application, 'ada');
  const borrowerId = (expectStatus(await operator.post('/customers', borrowerBody), 201).body as { id: string }).id;

  await application.relate({ object: `customer:${borrowerId}`, relation: 'self', subject: `user:${borrowerId}` });
  const applicant = await application.as({ id: borrowerId, tenantId: 'acme-bank' });
  const submitted = expectStatus(await applicant.post('/applications', request), 201);
  const applicationId = (submitted.body as { id: string }).id;

  await application.relate({
    object: `application:${applicationId}`,
    relation: 'customer',
    subject: `customer:${borrowerId}`,
  });

  return { applicationId, applicant };
}

/** The applicant consents, the accounts are read and a credit analyst consults the register: what an assessment rests on. */
export async function applicationWithAccountsAndRegister(application: RunningApplication): Promise<string> {
  const { applicationId, applicant } = await submittedApplication(application);

  expectStatus(await applicant.post(`/applications/${applicationId}/consent`, {}), 201);
  expectStatus(await applicant.post(`/applications/${applicationId}/account-information`, {}), 201);

  const credit = await analystOf(application, 'credit-analyst');

  expectStatus(await credit.post(`/applications/${applicationId}/register-consultations`, {}), 201);

  return applicationId;
}

/** A staff member of the context, an operator who assesses and reviews the applications. */
export async function analystOf(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:credit-application', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, tenantId: 'acme-bank' });
}

/** The scoring model version an assessment needs: published by the credit scoring operator. */
export async function publishScoringVersion(application: RunningApplication): Promise<void> {
  const operator = await creditScoringOperatorOf(application, 'olivia');

  expectStatus(await operator.post('/scoring-models', version), 201);
}
