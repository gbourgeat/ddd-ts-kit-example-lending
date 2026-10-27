export const CreditApplicationCodes = {
  InvalidAmount: 'INVALID_AMOUNT',
  InvalidDuration: 'INVALID_DURATION',
} as const;

export type CreditApplicationCode = (typeof CreditApplicationCodes)[keyof typeof CreditApplicationCodes];
