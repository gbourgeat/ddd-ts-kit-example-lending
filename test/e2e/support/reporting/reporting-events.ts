import { creditApplicationPayoutAuthorisedV1 } from '@/contexts/credit-application/published-language';
import { loanArrearsBucketEnteredV1 } from '@/contexts/servicing/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';

/** The tenant the bank's reports are read in, and in which these specs publish the events of the other contexts. */
export const REPORTING_TENANT = 'acme-bank';

/** The arrears buckets servicing announces, by the days past due of the oldest unpaid instalment. */
export type ArrearsBucket = 'OneToThirtyDays' | 'ThirtyOneToSixtyDays' | 'SixtyOneToNinetyDays' | 'OverNinetyDays';

/** Publishes the payout of an application on a branch, as credit-application's relay would, and settles the work it starts. */
export async function publishPayout(
  application: RunningApplication,
  payout: {
    readonly applicationId: string;
    readonly customerId: string;
    readonly branchId: string;
    readonly amountCents: number;
  },
): Promise<void> {
  await application.publish([
    {
      ...creditApplicationPayoutAuthorisedV1.create(
        {
          creditApplicationId: payout.applicationId,
          customerId: payout.customerId,
          branchId: payout.branchId,
          amountCents: payout.amountCents,
          durationMonths: 12,
          rateBasisPoints: 500,
        },
        { id: `payout-${payout.applicationId}`, occurredAt: '2026-03-01T00:00:00.000Z' },
      ),
      tenantId: REPORTING_TENANT,
    },
  ]);

  await application.settled();
}

/** Publishes the arrears bucket a loan entered, as servicing's relay would, and settles the work it starts. */
export async function publishBucketEntered(
  application: RunningApplication,
  entered: { readonly eventId: string; readonly loanId: string; readonly bucket: ArrearsBucket },
): Promise<void> {
  await application.publish([
    {
      ...loanArrearsBucketEnteredV1.create(
        { loanId: entered.loanId, bucket: entered.bucket },
        { id: entered.eventId, occurredAt: '2026-03-02T00:00:00.000Z' },
      ),
      tenantId: REPORTING_TENANT,
    },
  ]);

  await application.settled();
}
