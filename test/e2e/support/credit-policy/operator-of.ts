import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The tenant the credit policy of the bank is kept in: the reference data is read and written in it. */
export const creditPolicyTenantId = 'acme-bank';

/** Makes `id` an operator of credit-policy, which holds its permissions, and returns a client calling as them in the bank's tenant. */
export async function operatorOf(application: RunningApplication, id: string): Promise<HttpClient> {
  await application.relate({ object: 'context:credit-policy', relation: 'operator', subject: `user:${id}` });

  return application.as({ id, tenantId: creditPolicyTenantId });
}
