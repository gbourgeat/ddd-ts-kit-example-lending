import { describe, expect, it } from '@jest/globals';
import { RemoteScreeningProvider } from '@/contexts/customer-due-diligence/infrastructure/external/remote-screening-provider.adapter';

class UnwiredScreeningProvider extends RemoteScreeningProvider {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

describe('RemoteScreeningProvider', () => {
  it('is an adapter of the port, built without argument until its transport is written', () => {
    expect(new RemoteScreeningProvider()).toBeInstanceOf(RemoteScreeningProvider);
  });

  it('refuses to send a call as long as its transport is not written, and names the operation', async () => {
    const adapter = new UnwiredScreeningProvider();

    await expect(adapter.sendUnwired('ping')).rejects.toThrow('"ping" was not sent');
  });

  // TODO(domain): replace each entry below by a behaviour of ScreeningProvider against the real outside system or its sandbox; hold this adapter and the fake of test/fakes to the same expectations.
  it.todo('answers what the outside system answers, in the types of customer-due-diligence');
  it.todo('fails with a business error when the outside system refuses');
});

describe('RemoteScreeningProvider while its transport is not written', () => {
  it('refuses each call and names the operation it was asked', async () => {
    await expect(new RemoteScreeningProvider().screen('x', new Date(0))).rejects.toThrow('has no transport yet');
  });
});

class AbortedRemoteScreeningProvider extends RemoteScreeningProvider {
  sendAborted(signal: AbortSignal): Promise<unknown> {
    return this.transport({ operation: 'probe', payload: {} }, signal);
  }
}

describe('RemoteScreeningProvider when its call is aborted', () => {
  it('stops before the transport and refuses with the abort reason', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(new AbortedRemoteScreeningProvider().sendAborted(controller.signal)).rejects.toThrow();
  });
});
