import { expectStatus, type HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { operatorOf, registeredCustomer } from '$test/e2e/support/customer-due-diligence/customer-files';
import { branchOperatorOf } from '$test/e2e/support/branch-network/branch-operator';
import { openedBranchOf } from '$test/e2e/support/branch-network/opened-branch';

const request = { productId: 'personal-loan', amount: { cents: 1234567, currency: 'EUR' }, durationMonths: 60 };

/** The account of the advisor the explanation specs appoint, which declares its conflicts as itself. */
export const advisorAccount = 'advisor-grace';

/** The system actors of branch-network that open the portfolio of an appointed advisor and join an assigned customer to it: the reset empties their relationships. */
export const branchNetworkSystemActors = [
  'system:system:OpenPortfolioForAdvisorEventHandler',
  'system:system:branch-network.assign-identified-customer',
];

/**
 * A customer of the bank, assigned to an advisor appointed on an opened branch, whose application the customer submitted:
 * the application is in the portfolio of the advisor, which is what a reader of it is asked about.
 */
export async function advisedApplication(
  application: RunningApplication,
): Promise<{ applicationId: string; customerId: string; advisorId: string; accountId: string }> {
  for (const subject of branchNetworkSystemActors) {
    await application.relate({ object: 'context:branch-network', relation: 'operator', subject });
  }

  const branchOperator = await branchOperatorOf(application);
  const branchId = await openedBranchOf(branchOperator);

  const appointed = await branchOperator.post(`/branches/${branchId}/staff`, {
    name: 'Grace Hopper',
    email: `${advisorAccount}@example.test`,
    accountId: advisorAccount,
    level: 'advisor',
  });

  expectStatus(appointed, 201);
  const advisorId = (appointed.body as { id: string }).id;
  const operator = await operatorOf(application, 'ada');
  const customerId = await registeredCustomer(operator);

  expectStatus(await operator.put(`/customers/${customerId}/advisor`, { advisorId }), 200);
  await application.settled();

  await application.relate({ object: `customer:${customerId}`, relation: 'self', subject: `user:${customerId}` });
  const applicant = await application.as({ id: customerId, tenantId: 'acme-bank' });
  const submitted = expectStatus(await applicant.post('/applications', request), 201);
  const applicationId = (submitted.body as { id: string }).id;

  await application.relate({
    object: `application:${applicationId}`,
    relation: 'customer',
    subject: `customer:${customerId}`,
  });

  return { applicationId, customerId, advisorId, accountId: advisorAccount };
}

/** The advisor signed in as the staff member its portfolio names. */
export async function advisorClient(application: RunningApplication, advisorId: string): Promise<HttpClient> {
  return application.as({ id: advisorId, tenantId: 'acme-bank' });
}
