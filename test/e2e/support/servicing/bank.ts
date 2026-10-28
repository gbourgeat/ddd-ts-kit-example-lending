import { expectStatus } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The bank the nightly jobs of servicing run for, and the tenant its operators act in. */
export const BANK_TENANT = 'acme-bank';

/** Opens the bank as an administrator of identity: a nightly job refuses to run with no bank to run for. */
export async function openBank(app: RunningApplication, tenantId: string = BANK_TENANT): Promise<void> {
  await app.relate({ object: 'context:identity', relation: 'operator', subject: 'user:ada' });
  const ada = await app.as({ id: 'ada', roles: ['admin'] });

  expectStatus(await ada.put('/accounts/me', {}), 200);
  expectStatus(await ada.post('/organisations', { slug: tenantId, name: 'Acme Bank' }), 201);
}
