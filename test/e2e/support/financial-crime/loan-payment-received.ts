import { loanPaymentReceivedV1 } from '@/contexts/servicing/published-language';
import type { RunningApplication } from '$test/e2e/support/start-application';
import { bankTenantId } from '$test/e2e/support/financial-crime/alert-world';

export interface PaymentReceived {
  readonly eventId: string;
  readonly loanId: string;
  readonly instalmentNumber: number;
  readonly amountCents: number;
}

/**
 * Publishes the payment received of a loan, as servicing's relay would, and settles the work it starts.
 */
export async function publishLoanPaymentReceived(
  application: RunningApplication,
  payment: PaymentReceived,
): Promise<void> {
  await application.publish([
    {
      ...loanPaymentReceivedV1.create(
        { loanId: payment.loanId, instalmentNumber: payment.instalmentNumber, amountCents: payment.amountCents },
        { id: payment.eventId, occurredAt: '2026-06-01T00:00:00.000Z' },
      ),
      tenantId: bankTenantId,
    },
  ]);

  await application.settled();
}
