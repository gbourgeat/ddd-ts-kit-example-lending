export const CreditApplicationCodes = {
  InvalidAmount: 'INVALID_AMOUNT',
  InvalidDuration: 'INVALID_DURATION',
  InvalidNetIncome: 'INVALID_NET_INCOME',
} as const;

export type CreditApplicationCode = (typeof CreditApplicationCodes)[keyof typeof CreditApplicationCodes];
