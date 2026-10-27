import { describe, expect, it } from '@jest/globals';
import { RemotePaymentProvider } from '@/contexts/servicing/instalments/infrastructure/external/remote-payment-provider.adapter';

class UnwiredPaymentProvider extends RemotePaymentProvider {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

describe('RemotePaymentProvider', () => {
  it('is an adapter of the port, built without argument until its transport is written', () => {
    expect(new RemotePaymentProvider()).toBeInstanceOf(RemotePaymentProvider);
  });

  it('refuses to send a call as long as its transport is not written, and names the operation', async () => {
    const adapter = new UnwiredPaymentProvider();

    await expect(adapter.sendUnwired('ping')).rejects.toThrow('"ping" was not sent');
  });

  // TODO(domain): replace each entry below by a behaviour of PaymentProvider against the real outside system or its sandbox; hold this adapter and the fake of test/fakes to the same expectations.
  it.todo('answers what the outside system answers, in the types of servicing');
  it.todo('fails with a business error when the outside system refuses');
});

describe('RemotePaymentProvider while its transport is not written', () => {
  it('refuses each call and names the operation it was asked', async () => {
    await expect(new RemotePaymentProvider().collectDirectDebit('x', 1)).rejects.toThrow('has no transport yet');
  });
});

class AbortedRemotePaymentProvider extends RemotePaymentProvider {
  sendAborted(signal: AbortSignal): Promise<unknown> {
    return this.transport({ operation: 'probe', payload: {} }, signal);
  }
}

describe('RemotePaymentProvider when its call is aborted', () => {
  it('stops before the transport and refuses with the abort reason', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(new AbortedRemotePaymentProvider().sendAborted(controller.signal)).rejects.toThrow();
  });
});
