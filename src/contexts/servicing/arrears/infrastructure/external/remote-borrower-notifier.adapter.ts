import type { BorrowerNotifier } from '@/contexts/servicing/arrears/application/ports/borrower-notifier.port';

interface OutboundCall {
  readonly operation: string;
  readonly payload: unknown;
}

export class RemoteBorrowerNotifier implements BorrowerNotifier {
  async notify(borrowerName: string, message: string): Promise<void> {
    await this.transport({ operation: 'notify', payload: { borrowerName, message } });
  }

  // TODO(platform): replace the body by the real client of the outside system (fetch on a base URL of the validated config, an SDK), built from what the constructor receives in servicing.module.ts.
  protected async transport(call: OutboundCall, signal?: AbortSignal): Promise<unknown> {
    signal?.throwIfAborted();

    throw new Error(`RemoteBorrowerNotifier has no transport yet: "${call.operation}" was not sent`);
  }
}
