export abstract class ScoringGateway {
  // Asks credit-scoring for the score of an applicant, with the version of the model and the factors that lowered it; undefined when no model version is published.
  abstract scoreOf(inputs: {
    debtToIncomePercent: number;
    repaymentIncidents: number;
    residualIncomeCents: number;
  }): Promise<{ score: number; band: string; modelVersion: string; factors: string[] } | undefined>;
}
