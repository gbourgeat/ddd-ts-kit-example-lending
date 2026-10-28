import { creditApplicationWithdrawnV1 } from '@/contexts/credit-application/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { PAYOUT_TENANT } from '$test/e2e/support/servicing/payout-authorised';

/** Publishes the withdrawal of an application, as credit-application's relay would, and settles the work it starts. */
export async function publishWithdrawn(
  application: RunningApplication,
  withdrawal: { readonly applicationId: string; readonly occurredAt: string },
): Promise<void> {
  await application.publish([
    {
      ...creditApplicationWithdrawnV1.create(
        { creditApplicationId: withdrawal.applicationId },
        { id: `withdrawn-${withdrawal.applicationId}`, occurredAt: withdrawal.occurredAt },
      ),
      tenantId: PAYOUT_TENANT,
    },
  ]);

  await application.settled();
}
