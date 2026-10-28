import { loanDefaultedV1 } from '@/contexts/servicing/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { REPORTING_TENANT } from '$test/e2e/support/reporting/reporting-events';

/** Publishes the default of a loan, as servicing's relay would, at the instant given, and settles the work it starts. */
export async function publishLoanDefaulted(
  application: RunningApplication,
  declared: { readonly eventId: string; readonly loanId: string; readonly occurredAt: string },
): Promise<void> {
  await application.publish([
    {
      ...loanDefaultedV1.create({ loanId: declared.loanId }, { id: declared.eventId, occurredAt: declared.occurredAt }),
      tenantId: REPORTING_TENANT,
    },
  ]);

  await application.settled();
}
