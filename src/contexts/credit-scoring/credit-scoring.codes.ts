export const CreditScoringCodes = {
  ScoringModelLabelRequired: 'SCORING_MODEL_LABEL_REQUIRED',
  InvalidScore: 'INVALID_SCORE',
  InvalidFactor: 'INVALID_FACTOR',
} as const;

export type CreditScoringCode = (typeof CreditScoringCodes)[keyof typeof CreditScoringCodes];
