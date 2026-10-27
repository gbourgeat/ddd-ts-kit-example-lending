export const DelegationLevel = {
  Advisor: 'advisor',
  CreditAnalyst: 'credit-analyst',
  RiskManager: 'risk-manager',
  CreditCommittee: 'credit-committee',
} as const;

export type DelegationLevel = (typeof DelegationLevel)[keyof typeof DelegationLevel];
