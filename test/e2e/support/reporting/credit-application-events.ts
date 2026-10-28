import {
  creditApplicationDecidedV1,
  creditApplicationSubmittedV2,
} from '@/contexts/credit-application/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { REPORTING_TENANT } from '$test/e2e/support/reporting/reporting-events';

/** An application submitted on a branch, as credit-application's relay announces it. */
export interface SubmittedApplication {
  readonly eventId: string;
  readonly applicationId: string;
  readonly branchId: string;
  readonly requestedAmountCents: number;
  readonly occurredAt: string;
}

/** A decision on an application of a branch, as credit-application's relay announces it. */
export interface DecidedApplication {
  readonly eventId: string;
  readonly applicationId: string;
  readonly branchId: string;
  readonly outcome: 'approve' | 'approve-with-conditions' | 'refuse';
  readonly exception: boolean;
  readonly occurredAt: string;
}

/** Publishes the submissions of applications, and settles the work they start. */
export async function publishSubmitted(
  application: RunningApplication,
  submitted: readonly SubmittedApplication[],
): Promise<void> {
  await application.publish(
    submitted.map((declared) => ({
      ...creditApplicationSubmittedV2.create(
        {
          creditApplicationId: declared.applicationId,
          applicantId: 'applicant-1',
          requestedAmountCents: declared.requestedAmountCents,
          durationMonths: 60,
          branchId: declared.branchId,
        },
        { id: declared.eventId, occurredAt: declared.occurredAt },
      ),
      tenantId: REPORTING_TENANT,
    })),
  );

  await application.settled();
}

/** Publishes the decisions of applications, and settles the work they start. */
export async function publishDecided(
  application: RunningApplication,
  decided: readonly DecidedApplication[],
): Promise<void> {
  await application.publish(
    decided.map((declared) => ({
      ...creditApplicationDecidedV1.create(
        {
          creditApplicationId: declared.applicationId,
          outcome: declared.outcome,
          exception: declared.exception,
          branchId: declared.branchId,
          approvedAmountCents: 0,
        },
        { id: declared.eventId, occurredAt: declared.occurredAt },
      ),
      tenantId: REPORTING_TENANT,
    })),
  );

  await application.settled();
}
