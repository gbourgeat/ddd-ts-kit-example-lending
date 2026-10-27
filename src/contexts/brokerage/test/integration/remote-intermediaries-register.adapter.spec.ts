import { describe, expect, it } from '@jest/globals';
import { RemoteIntermediariesRegister } from '@/contexts/brokerage/infrastructure/external/remote-intermediaries-register.adapter';

class UnwiredIntermediariesRegister extends RemoteIntermediariesRegister {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

describe('RemoteIntermediariesRegister', () => {
  it('is an adapter of the port, built without argument until its transport is written', () => {
    expect(new RemoteIntermediariesRegister()).toBeInstanceOf(RemoteIntermediariesRegister);
  });

  it('refuses to send a call as long as its transport is not written, and names the operation', async () => {
    const adapter = new UnwiredIntermediariesRegister();

    await expect(adapter.sendUnwired('ping')).rejects.toThrow('"ping" was not sent');
  });

  // TODO(domain): replace each entry below by a behaviour of IntermediariesRegister against the real outside system or its sandbox; hold this adapter and the fake of test/fakes to the same expectations.
  it.todo('answers what the outside system answers, in the types of brokerage');
  it.todo('fails with a business error when the outside system refuses');
});

describe('RemoteIntermediariesRegister while its transport is not written', () => {
  it('refuses each call and names the operation it was asked', async () => {
    await expect(new RemoteIntermediariesRegister().isValidOn('x', new Date(0))).rejects.toThrow(
      'has no transport yet',
    );
  });
});

class AbortedRemoteIntermediariesRegister extends RemoteIntermediariesRegister {
  sendAborted(signal: AbortSignal): Promise<unknown> {
    return this.transport({ operation: 'probe', payload: {} }, signal);
  }
}

describe('RemoteIntermediariesRegister when its call is aborted', () => {
  it('stops before the transport and refuses with the abort reason', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(new AbortedRemoteIntermediariesRegister().sendAborted(controller.signal)).rejects.toThrow();
  });
});
