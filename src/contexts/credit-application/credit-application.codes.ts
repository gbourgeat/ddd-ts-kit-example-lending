export const CreditApplicationCodes = {
  InvalidAmount: 'INVALID_AMOUNT',
  InvalidDuration: 'INVALID_DURATION',
  InvalidNetIncome: 'INVALID_NET_INCOME',
  InvalidAnnualPercentageRate: 'INVALID_ANNUAL_PERCENTAGE_RATE',
} as const;

export type CreditApplicationCode = (typeof CreditApplicationCodes)[keyof typeof CreditApplicationCodes];
