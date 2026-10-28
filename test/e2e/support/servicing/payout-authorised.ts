import { creditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language';
import type { HttpClient } from '@ddd-ts-kit/testing/e2e';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The tenant the borrower and the system act for in these specs. */
export const PAYOUT_TENANT = 'acme-bank';

/** The borrower of an application, who reads the application and so its loan: a broker of the application here. */
export async function borrowerOf(
  application: RunningApplication,
  id: string,
  applicationId: string,
): Promise<HttpClient> {
  await application.relate({ object: `application:${applicationId}`, relation: 'broker', subject: `user:${id}` });

  return application.as({ id, roles: [], tenantId: PAYOUT_TENANT });
}

/** Publishes the payout authorisation of an application, as credit-application's relay would, and settles the work it starts. */
export async function publishPayoutAuthorised(
  application: RunningApplication,
  payout: { readonly applicationId: string; readonly customerId: string; readonly occurredAt?: string },
): Promise<void> {
  await application.publish([
    {
      ...creditApplicationPayoutAuthorisedV1.create(
        {
          creditApplicationId: payout.applicationId,
          customerId: payout.customerId,
          branchId: 'branch-1',
          amountCents: 100_000,
          durationMonths: 12,
          rateBasisPoints: 500,
        },
        {
          id: `payout-authorised-${payout.applicationId}`,
          occurredAt: payout.occurredAt ?? '2026-03-01T00:00:00.000Z',
        },
      ),
      tenantId: PAYOUT_TENANT,
    },
  ]);

  await application.settled();
}
