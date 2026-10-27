import type { PaymentProvider } from '@/contexts/servicing/instalments/application/ports/payment-provider.port';

export class SimulatedPaymentProvider implements PaymentProvider {
  private readonly mandates = new Set<string>();

  record(mandateReference: string): void {
    this.mandates.add(mandateReference);
  }

  async collectDirectDebit(mandateReference: string, amountInCents: number): Promise<{ readonly accepted: boolean }> {
    return { accepted: this.mandates.has(mandateReference) && amountInCents > 0 };
  }
}
