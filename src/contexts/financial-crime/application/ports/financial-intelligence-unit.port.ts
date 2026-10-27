export abstract class FinancialIntelligenceUnit {
  /** Files a suspicious activity report with the financial intelligence unit; the answer is its filing reference. */
  abstract fileReport(subjectReference: string): Promise<string>;
}
