import type { FinancialIntelligenceUnit } from '@/contexts/financial-crime/application/ports/financial-intelligence-unit.port';

/** A financial intelligence unit that is down: every report it is sent is refused, as the remote adapter refuses it today. */
export class UnreachableFinancialIntelligenceUnit implements FinancialIntelligenceUnit {
  async fileReport(subjectReference: string): Promise<string> {
    throw new Error(`The financial intelligence unit is down: "${subjectReference}" was not received`);
  }
}
