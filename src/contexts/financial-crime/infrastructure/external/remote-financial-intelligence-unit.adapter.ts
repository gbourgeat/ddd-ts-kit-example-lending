import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteFinancialIntelligenceUnit implements FinancialIntelligenceUnit {
  async fileReport(subjectReference: string): Promise<string> {
    const answer = await this.transport({ operation: 'fileReport', payload: { subjectReference } });

    if (typeof answer !== 'string') {
      throw new Error(
        `The financial intelligence unit answered "${typeof answer}" to "fileReport", not a filing reference`,
      );
    }

    return answer;
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in financial-crime.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteFinancialIntelligenceUnit has no transport yet: "${call.operation}" was not sent`);
  }
}
