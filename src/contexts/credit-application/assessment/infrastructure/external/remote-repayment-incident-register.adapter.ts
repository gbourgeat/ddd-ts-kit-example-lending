import type { RepaymentIncidentRegister } from '@/contexts/credit-application/assessment/application/ports/repayment-incident-register.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteRepaymentIncidentRegister implements RepaymentIncidentRegister {
  async isListed(name: string, birthDate: Date): Promise<boolean> {
    // TODO(domain): translate the answer of the outside system into the type of the port, checked, not cast.
    return (await this.transport({ operation: 'isListed', payload: { name, birthDate } })) as boolean;
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in credit-application.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteRepaymentIncidentRegister has no transport yet: "${call.operation}" was not sent`);
  }
}
