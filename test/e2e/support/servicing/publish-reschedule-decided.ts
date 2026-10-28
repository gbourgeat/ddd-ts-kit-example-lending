import { creditApplicationRescheduleDecidedV1 } from '@/contexts/credit-application/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { PAYOUT_TENANT } from '$test/e2e/support/servicing/payout-authorised';

/** Publishes the rescheduling decided on an application, as credit-application's relay would, and settles the work it starts. */
export async function publishRescheduleDecided(
  application: RunningApplication,
  decision: {
    readonly eventId: string;
    readonly applicationId: string;
    readonly durationMonths: number;
    readonly outstandingAmountCents: number;
  },
): Promise<void> {
  await application.publish([
    {
      ...creditApplicationRescheduleDecidedV1.create(
        {
          creditApplicationId: decision.applicationId,
          durationMonths: decision.durationMonths,
          outstandingAmountCents: decision.outstandingAmountCents,
        },
        { id: decision.eventId, occurredAt: '2026-06-15T00:00:00.000Z' },
      ),
      tenantId: PAYOUT_TENANT,
    },
  ]);

  await application.settled();
}
