import type { PaymentProvider } from '@/contexts/servicing/instalments/application/ports/payment-provider.port';

/**
 * The payment provider of the simulation: a direct debit of a positive amount is accepted, except on a mandate whose
 * reference starts with the refused prefix, which the simulated payer's bank refuses. A loan's mandate is its id.
 */
export class SimulatedPaymentProvider implements PaymentProvider {
  static readonly refusedMandatePrefix = 'refused-';

  async collectDirectDebit(mandateReference: string, amountInCents: number): Promise<{ readonly accepted: boolean }> {
    const refused = mandateReference.startsWith(SimulatedPaymentProvider.refusedMandatePrefix);

    return { accepted: amountInCents > 0 && !refused };
  }
}
