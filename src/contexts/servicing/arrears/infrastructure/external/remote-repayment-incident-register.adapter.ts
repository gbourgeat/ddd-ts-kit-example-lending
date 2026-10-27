import type { RepaymentIncidentRegister } from '@/contexts/servicing/arrears/application/ports/repayment-incident-register.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteRepaymentIncidentRegister implements RepaymentIncidentRegister {
  async declare(loanReference: string): Promise<void> {
    await this.transport({ operation: 'declare', payload: { loanReference } });
  }

  async withdraw(loanReference: string): Promise<void> {
    await this.transport({ operation: 'withdraw', payload: { loanReference } });
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in servicing.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteRepaymentIncidentRegister has no transport yet: "${call.operation}" was not sent`);
  }
}
