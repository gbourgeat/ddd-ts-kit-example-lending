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
  NoAdvisorBranch: 'NO_ADVISOR_BRANCH',
} as const;

export type CreditApplicationCode = (typeof CreditApplicationCodes)[keyof typeof CreditApplicationCodes];
