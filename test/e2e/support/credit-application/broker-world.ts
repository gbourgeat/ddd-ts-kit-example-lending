import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

export const registrationNumber = 'REG-0001';
export const dailyCheck = 'brokerage.check-registration';

/** The system actor of credit-application that keeps the registrations: the reset of the database empties its relationships. */
export const keepRegistrationSystemActor = 'system:system:credit-application.keep-broker-registration';

/** Opens the bank as an administrator of identity: its id is the tenant the work of the bank runs in. */
export async function openBank(app: RunningApplication): Promise<string> {
  await app.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'] });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  const opened = expectStatus(await ada.post('/organisations', { slug: 'acme-bank', name: 'Acme Bank' }), 201);

  return (opened.body as { id: string }).id;
}

/** Registers a broker of the bank while its registration is valid, and returns its id. */
export async function registerBroker(
  app: RunningApplication,
  bank: string,
  number: string = registrationNumber,
): Promise<string> {
  await app.relate({ object: 'context:brokerage', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'], tenantId: bank });

  app.register.markValid(number);
  const created = expectStatus(await ada.post('/brokers', { registrationNumber: number }), 201);

  return (created.body as { id: string }).id;
}

/** The broker signed in as itself: the relation that lets it bring applications was written by its registration, not here. */
export async function brokerOf(app: RunningApplication, brokerId: string, bank: string): Promise<HttpClient> {
  return app.as({ id: brokerId, tenantId: bank });
}
