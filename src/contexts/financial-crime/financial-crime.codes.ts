export const FinancialCrimeCodes = {
  AlertAlreadyClosed: 'ALERT_ALREADY_CLOSED',
  UnknownAlert: 'UNKNOWN_ALERT',
  ClosureReasonMissing: 'CLOSURE_REASON_MISSING',
} as const;

export type FinancialCrimeCode = (typeof FinancialCrimeCodes)[keyof typeof FinancialCrimeCodes];
