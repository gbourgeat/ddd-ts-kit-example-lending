export const CreditScoringCodes = {
  ScoringModelLabelRequired: 'SCORING_MODEL_LABEL_REQUIRED',
  InvalidScore: 'INVALID_SCORE',
  InvalidFactor: 'INVALID_FACTOR',
  InvalidApplicantInput: 'INVALID_APPLICANT_INPUT',
  UnknownModelVersion: 'UNKNOWN_MODEL_VERSION',
} as const;

export type CreditScoringCode = (typeof CreditScoringCodes)[keyof typeof CreditScoringCodes];
