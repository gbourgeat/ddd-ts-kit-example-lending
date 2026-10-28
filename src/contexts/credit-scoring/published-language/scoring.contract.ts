export abstract class ScoringContract {
  // Scores an applicant with the latest published version of the scoring model; undefined when no version is published yet.
  abstract scoreOf(inputs: {
    debtToIncomePercent: number;
    repaymentIncidents: number;
    residualIncomeCents: number;
  }): Promise<{ score: number; band: string; modelVersion: string; factors: string[] } | undefined>;
}
