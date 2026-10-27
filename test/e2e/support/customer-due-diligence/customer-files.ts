import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The identity of a person as the bank checks it: an identity document valid in 2030, a proof of address dated today. */
export function aPersonBody(documentNumber: string): Record<string, string> {
  return {
    documentKind: 'Passport',
    documentNumber,
    issuingCountry: 'FR',
    documentExpiresOn: '2030-01-01T00:00:00.000Z',
    address: '1 rue de la Paix, 75002 Paris',
    addressProofDatedOn: new Date().toISOString(),
    name: 'Ada Lovelace',
    birthDate: '1980-05-01T00:00:00.000Z',
  };
}

/** A signed-in person who operates the context customer-due-diligence, as the operators of the context are granted. */
export async function operatorOf(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:customer-due-diligence', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, roles: [], tenantId: 'acme-bank' });
}

/** A customer identified by the operator, whose business is registered: the identifier of the customer. */
export async function registeredCustomer(operator: HttpClient): Promise<string> {
  const identified = await operator.post('/customers', aPersonBody('12AB34567'));

  expectStatus(identified, 201);

  const { id } = identified.body as { id: string };

  expectStatus(
    await operator.post('/businesses', {
      customerId: id,
      legalName: 'Acme SAS',
      registrationNumber: '123456789',
      countryOfRegistration: 'FR',
      registeredOn: '2026-01-10T00:00:00.000Z',
    }),
    201,
  );

  return id;
}
