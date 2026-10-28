export const FinancialCrimeCodes = {
  AlertAlreadyClosed: 'ALERT_ALREADY_CLOSED',
  UnknownAlert: 'UNKNOWN_ALERT',
  ClosureReasonMissing: 'CLOSURE_REASON_MISSING',
  UnknownSuspiciousActivityReport: 'UNKNOWN_SUSPICIOUS_ACTIVITY_REPORT',
} as const;

export type FinancialCrimeCode = (typeof FinancialCrimeCodes)[keyof typeof FinancialCrimeCodes];
