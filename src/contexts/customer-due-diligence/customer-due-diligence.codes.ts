export const CustomerDueDiligenceCodes = {
  BusinessAlreadyRegistered: 'BUSINESS_ALREADY_REGISTERED',
  UnknownCustomer: 'UNKNOWN_CUSTOMER',
  IdentityDocumentExpired: 'IDENTITY_DOCUMENT_EXPIRED',
  ProofOfAddressTooOld: 'PROOF_OF_ADDRESS_TOO_OLD',
} as const;

export type CustomerDueDiligenceCode = (typeof CustomerDueDiligenceCodes)[keyof typeof CustomerDueDiligenceCodes];
