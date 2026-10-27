import type { PaymentProvider } from '@/contexts/servicing/instalments/application/ports/payment-provider.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemotePaymentProvider implements PaymentProvider {
  async collectDirectDebit(mandateReference: string, amountInCents: number): Promise<{ readonly accepted: boolean }> {
    // TODO(domain): translate the answer of the outside system into the type of the port, checked, not cast.
    return (await this.transport({
      operation: 'collectDirectDebit',
      payload: { mandateReference, amountInCents },
    })) as { accepted: boolean };
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in servicing.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemotePaymentProvider has no transport yet: "${call.operation}" was not sent`);
  }
}
