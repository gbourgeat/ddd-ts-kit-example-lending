export const ServicingCodes = {
  InvalidSchedule: 'INVALID_SCHEDULE',
  LoanAlreadyClosed: 'LOAN_ALREADY_CLOSED',
  InvalidBorrower: 'INVALID_BORROWER',
  UnknownLoan: 'UNKNOWN_LOAN',
} as const;

export type ServicingCode = (typeof ServicingCodes)[keyof typeof ServicingCodes];
