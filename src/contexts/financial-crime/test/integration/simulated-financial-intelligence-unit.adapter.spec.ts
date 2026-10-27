import { describe, expect, it } from '@jest/globals';
import { SimulatedFinancialIntelligenceUnit } from '@/contexts/financial-crime/infrastructure/external/simulated-financial-intelligence-unit.adapter';

describe('SimulatedFinancialIntelligenceUnit', () => {
  it('is an adapter of the port, built without argument: it reaches nothing outside the process', () => {
    expect(new SimulatedFinancialIntelligenceUnit()).toBeInstanceOf(SimulatedFinancialIntelligenceUnit);
  });

  it('answers a filing reference for a report it receives', async () => {
    const unit = new SimulatedFinancialIntelligenceUnit();

    await expect(unit.fileReport('SUBJECT-1')).resolves.toMatch(/^FIU-/);
  });

  it('answers each report with its own filing reference', async () => {
    const unit = new SimulatedFinancialIntelligenceUnit();
    const first = await unit.fileReport('SUBJECT-1');
    const second = await unit.fileReport('SUBJECT-2');

    expect(second).not.toBe(first);
  });
});
