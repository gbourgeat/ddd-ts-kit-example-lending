import { describe, expect, it } from '@jest/globals';
import { RemoteFinancialIntelligenceUnit } from '@/contexts/financial-crime/infrastructure/external/remote-financial-intelligence-unit.adapter';

class UnwiredFinancialIntelligenceUnit extends RemoteFinancialIntelligenceUnit {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

describe('RemoteFinancialIntelligenceUnit', () => {
  it('is an adapter of the port, built without argument until its transport is written', () => {
    expect(new RemoteFinancialIntelligenceUnit()).toBeInstanceOf(RemoteFinancialIntelligenceUnit);
  });

  it('refuses to send a call as long as its transport is not written, and names the operation', async () => {
    const adapter = new UnwiredFinancialIntelligenceUnit();

    await expect(adapter.sendUnwired('ping')).rejects.toThrow('"ping" was not sent');
  });

  // TODO(domain): replace each entry below by a behaviour of FinancialIntelligenceUnit against the real outside system or its sandbox; hold this adapter and the fake of test/fakes to the same expectations.
  it.todo('answers what the outside system answers, in the types of financial-crime');
  it.todo('fails with a business error when the outside system refuses');
});

describe('RemoteFinancialIntelligenceUnit while its transport is not written', () => {
  it('refuses each call and names the operation it was asked', async () => {
    await expect(new RemoteFinancialIntelligenceUnit().fileReport('x')).rejects.toThrow('has no transport yet');
  });
});

class AbortedRemoteFinancialIntelligenceUnit extends RemoteFinancialIntelligenceUnit {
  sendAborted(signal: AbortSignal): Promise<unknown> {
    return this.transport({ operation: 'probe', payload: {} }, signal);
  }
}

describe('RemoteFinancialIntelligenceUnit when its call is aborted', () => {
  it('stops before the transport and refuses with the abort reason', async () => {
    const controller = new AbortController();

    controller.abort();

    await expect(new AbortedRemoteFinancialIntelligenceUnit().sendAborted(controller.signal)).rejects.toThrow();
  });
});
