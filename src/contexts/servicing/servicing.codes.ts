export const ServicingCodes = {
  InvalidSchedule: 'INVALID_SCHEDULE',
  LoanAlreadyClosed: 'LOAN_ALREADY_CLOSED',
  InvalidBorrower: 'INVALID_BORROWER',
  UnknownLoan: 'UNKNOWN_LOAN',
  BorrowerNotIdentified: 'BORROWER_NOT_IDENTIFIED',
  InvalidRepayment: 'INVALID_REPAYMENT',
  LoanNotWrittenOff: 'LOAN_NOT_WRITTEN_OFF',
  EarlyRepaymentTooHigh: 'EARLY_REPAYMENT_TOO_HIGH',
} as const;

export type ServicingCode = (typeof ServicingCodes)[keyof typeof ServicingCodes];
