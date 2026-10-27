export const ServicingCodes = {
  InvalidSchedule: 'INVALID_SCHEDULE',
} as const;

export type ServicingCode = (typeof ServicingCodes)[keyof typeof ServicingCodes];
