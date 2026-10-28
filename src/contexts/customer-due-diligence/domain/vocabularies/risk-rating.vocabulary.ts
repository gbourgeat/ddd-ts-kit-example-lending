export const RiskRating = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const;

export type RiskRating = (typeof RiskRating)[keyof typeof RiskRating];
