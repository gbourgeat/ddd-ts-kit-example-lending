import type { IntermediariesRegister } from '@/contexts/brokerage/application/ports/intermediaries-register.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteIntermediariesRegister implements IntermediariesRegister {
  async isValidOn(registrationNumber: string, day: Date): Promise<boolean> {
    // TODO(domain): translate the answer of the register into a boolean of brokerage, checked, not cast.
    return (await this.transport({ operation: 'isValidOn', payload: { registrationNumber, day } })) as boolean;
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in brokerage.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteIntermediariesRegister has no transport yet: "${call.operation}" was not sent`);
  }
}
