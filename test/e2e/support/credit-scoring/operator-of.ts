import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The tenant the bank's scoring model is kept in. */
export const creditScoringTenantId = 'acme-bank';

/** Makes `id` an operator of credit-scoring, which holds its permissions, and returns a client calling as them in the bank's tenant. */
export async function operatorOf(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:credit-scoring', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, tenantId: creditScoringTenantId });
}
