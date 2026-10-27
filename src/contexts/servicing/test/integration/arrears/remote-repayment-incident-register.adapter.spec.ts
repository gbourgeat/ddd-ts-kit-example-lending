import { describe, expect, it } from '@jest/globals';
import { RemoteRepaymentIncidentRegister } from '@/contexts/servicing/arrears/infrastructure/external/remote-repayment-incident-register.adapter';

class UnwiredRepaymentIncidentRegister extends RemoteRepaymentIncidentRegister {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

describe('RemoteRepaymentIncidentRegister', () => {
  it('is an adapter of the port, built without argument until its transport is written', () => {
    expect(new RemoteRepaymentIncidentRegister()).toBeInstanceOf(RemoteRepaymentIncidentRegister);
  });

  it('refuses to send a call as long as its transport is not written, and names the operation', async () => {
    const adapter = new UnwiredRepaymentIncidentRegister();

    await expect(adapter.sendUnwired('ping')).rejects.toThrow('"ping" was not sent');
  });

  // TODO(domain): replace each entry below by a behaviour of RepaymentIncidentRegister against the real outside system or its sandbox; hold this adapter and the fake of test/fakes to the same expectations.
  it.todo('answers what the outside system answers, in the types of servicing');
  it.todo('fails with a business error when the outside system refuses');
});

describe('RemoteRepaymentIncidentRegister while its transport is not written', () => {
  it('refuses each call and names the operation it was asked', async () => {
    await expect(new RemoteRepaymentIncidentRegister().declare('x')).rejects.toThrow('has no transport yet');
    await expect(new RemoteRepaymentIncidentRegister().withdraw('x')).rejects.toThrow('has no transport yet');
  });
});

class AbortedRemoteRepaymentIncidentRegister extends RemoteRepaymentIncidentRegister {
  sendAborted(signal: AbortSignal): Promise<unknown> {
    return this.transport({ operation: 'probe', payload: {} }, signal);
  }
}

describe('RemoteRepaymentIncidentRegister when its call is aborted', () => {
  it('stops before the transport and refuses with the abort reason', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(new AbortedRemoteRepaymentIncidentRegister().sendAborted(controller.signal)).rejects.toThrow();
  });
});
