import type { PaymentProvider } from '@/contexts/servicing/instalments/application/ports/payment-provider.port';

export class FakePaymentProvider implements PaymentProvider {
  readonly collected: { mandateReference: string; amountInCents: number }[] = [];

  private readonly rejected = new Set<string>();

  markRejected(mandateReference: string): void {
    this.rejected.add(mandateReference);
  }

  async collectDirectDebit(mandateReference: string, amountInCents: number): Promise<{ readonly accepted: boolean }> {
    this.collected.push({ mandateReference, amountInCents });

    return { accepted: !this.rejected.has(mandateReference) };
  }
}
