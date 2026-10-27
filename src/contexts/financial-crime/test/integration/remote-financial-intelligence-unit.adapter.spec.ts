import { describe, expect, it } from '@jest/globals';
import { RemoteFinancialIntelligenceUnit } from '@/contexts/financial-crime/infrastructure/external/remote-financial-intelligence-unit.adapter';

class UnwiredFinancialIntelligenceUnit extends RemoteFinancialIntelligenceUnit {
  async sendUnwired(operation: string): Promise<unknown> {
    return this.transport({ operation, payload: {} });
  }
}

/** A remote unit whose outside system answers the given value. */
class AnsweringFinancialIntelligenceUnit extends RemoteFinancialIntelligenceUnit {
  constructor(private readonly answer: unknown) {
    super();
  }

  protected override async transport(): Promise<unknown> {
    return this.answer;
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

  it('answers the filing reference the outside system gives for a report', async () => {
    const adapter = new AnsweringFinancialIntelligenceUnit('FIU-9');

    expect(await adapter.fileReport('alert-1')).toBe('FIU-9');
  });

  it('refuses an answer that is not a filing reference', async () => {
    const adapter = new AnsweringFinancialIntelligenceUnit(42);

    await expect(adapter.fileReport('alert-1')).rejects.toThrow('not a filing reference');
  });

  it('refuses to file a report while the outside system is down, and names the operation', async () => {
    const adapter = new RemoteFinancialIntelligenceUnit();

    await expect(adapter.fileReport('alert-1')).rejects.toThrow('"fileReport" was not sent');
  });
});
