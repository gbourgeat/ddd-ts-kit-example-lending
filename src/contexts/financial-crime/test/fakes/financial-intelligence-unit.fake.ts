import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';

export class FakeFinancialIntelligenceUnit implements FinancialIntelligenceUnit {
  readonly filed: string[] = [];

  async fileReport(subjectReference: string): Promise<string> {
    this.filed.push(subjectReference);

    return `filing-${this.filed.length}`;
  }
}
