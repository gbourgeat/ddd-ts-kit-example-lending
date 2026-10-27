import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';

export class SimulatedFinancialIntelligenceUnit implements FinancialIntelligenceUnit {
  private readonly reports: string[] = [];

  async fileReport(subjectReference: string): Promise<string> {
    this.reports.push(subjectReference);

    return 'FIU-' + this.reports.length;
  }
}
