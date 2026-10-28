export const RiskLevel = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];
