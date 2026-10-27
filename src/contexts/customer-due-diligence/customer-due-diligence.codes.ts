export const CustomerDueDiligenceCodes = {
  BusinessAlreadyRegistered: 'BUSINESS_ALREADY_REGISTERED',
  UnknownCustomer: 'UNKNOWN_CUSTOMER',
} as const;

export type CustomerDueDiligenceCode = (typeof CustomerDueDiligenceCodes)[keyof typeof CustomerDueDiligenceCodes];
