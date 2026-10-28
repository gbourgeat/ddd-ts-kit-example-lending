import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

const branchNetworkTenantId = 'acme-bank';

/**
 * Gives ada the operation of branch-network, and the system actor of the reaction to an appointment the relationship
 * it needs: the reset empties the relationships of the system actors too. Returns ada's client.
 */
export async function branchOperatorOf(application: RunningApplication): Promise<HttpClient> {
  await application.relate({ object: 'context:branch-network', relation: 'operator', subject: 'user:ada' });

  await application.relate({
    object: 'context:branch-network',
    relation: 'operator',
    subject: 'system:system:OpenPortfolioForAdvisorEventHandler',
  });

  return application.as({ id: 'ada', tenantId: branchNetworkTenantId });
}
