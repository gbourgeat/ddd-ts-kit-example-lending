import type { ScreeningProvider } from '@/contexts/customer-due-diligence/application/ports/screening-provider.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteScreeningProvider implements ScreeningProvider {
  async screen(name: string, birthDate: Date): Promise<{ readonly possibleMatch: boolean }> {
    // TODO(domain): translate the answer of the outside system into the type of customer-due-diligence, checked, not cast.
    return (await this.transport({ operation: 'screen', payload: { name, birthDate } })) as { possibleMatch: boolean };
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in customer-due-diligence.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteScreeningProvider has no transport yet: "${call.operation}" was not sent`);
  }
}
