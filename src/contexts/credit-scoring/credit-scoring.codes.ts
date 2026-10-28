export const CreditScoringCodes = {
  ScoringModelLabelRequired: 'SCORING_MODEL_LABEL_REQUIRED',
} as const;

export type CreditScoringCode = (typeof CreditScoringCodes)[keyof typeof CreditScoringCodes];
