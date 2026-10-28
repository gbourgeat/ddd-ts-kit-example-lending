export const ReportingCodes = {
  ApplicationCount: 'APPLICATION_COUNT',
} as const;

export type ReportingCode = (typeof ReportingCodes)[keyof typeof ReportingCodes];
