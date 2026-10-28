export const CreditApplicationCodes = {
  InvalidAmount: 'INVALID_AMOUNT',
  InvalidDuration: 'INVALID_DURATION',
  InvalidNetIncome: 'INVALID_NET_INCOME',
  InvalidAnnualPercentageRate: 'INVALID_ANNUAL_PERCENTAGE_RATE',
  UnknownCreditApplication: 'UNKNOWN_CREDIT_APPLICATION',
  UnknownEntry: 'UNKNOWN_ENTRY',
  CorrectionAlreadyRecorded: 'CORRECTION_ALREADY_RECORDED',
  InvalidCorrectionReason: 'INVALID_CORRECTION_REASON',
  MissingAccountConsent: 'MISSING_ACCOUNT_CONSENT',
  UnidentifiedParty: 'UNIDENTIFIED_PARTY',
  UnknownDelegationTable: 'UNKNOWN_DELEGATION_TABLE',
  UnknownDeciderLevel: 'UNKNOWN_DECIDER_LEVEL',
  UnknownRateGrid: 'UNKNOWN_RATE_GRID',
  UnknownLegalMaximumRate: 'UNKNOWN_LEGAL_MAXIMUM_RATE',
  UnknownProductTerms: 'UNKNOWN_PRODUCT_TERMS',
  UnknownBrokerRegistration: 'UNKNOWN_BROKER_REGISTRATION',
} as const;

export type CreditApplicationCode = (typeof CreditApplicationCodes)[keyof typeof CreditApplicationCodes];
