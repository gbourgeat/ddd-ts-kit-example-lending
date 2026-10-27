import { describe, expect, it } from '@jest/globals';
import { RemoteAccountInformationProvider } from '@/contexts/credit-application/assessment/infrastructure/external/remote-account-information-provider.adapter';

class UnwiredAccountInformationProvider extends RemoteAccountInformationProvider {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

describe('RemoteAccountInformationProvider', () => {
  it('is an adapter of the port, built without argument until its transport is written', () => {
    expect(new RemoteAccountInformationProvider()).toBeInstanceOf(RemoteAccountInformationProvider);
  });

  it('refuses to send a call as long as its transport is not written, and names the operation', async () => {
    const adapter = new UnwiredAccountInformationProvider();

    await expect(adapter.sendUnwired('ping')).rejects.toThrow('"ping" was not sent');
  });

  // TODO(domain): replace each entry below by a behaviour of AccountInformationProvider against the real outside system or its sandbox; hold this adapter and the fake of test/fakes to the same expectations.
  it.todo('answers what the outside system answers, in the types of credit-application');
  it.todo('fails with a business error when the outside system refuses');
});

describe('RemoteAccountInformationProvider while its transport is not written', () => {
  it('refuses each call and names the operation it was asked', async () => {
    await expect(new RemoteAccountInformationProvider().readIncomeAndExpenses('x')).rejects.toThrow(
      'has no transport yet',
    );
  });
});

class AbortedRemoteAccountInformationProvider extends RemoteAccountInformationProvider {
  sendAborted(signal: AbortSignal): Promise<unknown> {
    return this.transport({ operation: 'probe', payload: {} }, signal);
  }
}

describe('RemoteAccountInformationProvider when its call is aborted', () => {
  it('stops before the transport and refuses with the abort reason', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(new AbortedRemoteAccountInformationProvider().sendAborted(controller.signal)).rejects.toThrow();
  });
});
