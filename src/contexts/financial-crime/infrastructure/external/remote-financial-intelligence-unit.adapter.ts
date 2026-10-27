import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteFinancialIntelligenceUnit implements FinancialIntelligenceUnit {
  async fileReport(subjectReference: string): Promise<string> {
    // TODO(domain): translate the answer of the outside system into the type of the port, checked, not cast.
    return (await this.transport({ operation: 'fileReport', payload: { subjectReference } })) as string;
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in financial-crime.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteFinancialIntelligenceUnit has no transport yet: "${call.operation}" was not sent`);
  }
}
