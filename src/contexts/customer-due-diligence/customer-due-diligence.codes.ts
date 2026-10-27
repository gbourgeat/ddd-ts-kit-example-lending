export const CustomerDueDiligenceCodes = {
  BusinessAlreadyRegistered: 'BUSINESS_ALREADY_REGISTERED',
  UnknownCustomer: 'UNKNOWN_CUSTOMER',
  IdentityDocumentExpired: 'IDENTITY_DOCUMENT_EXPIRED',
  ProofOfAddressTooOld: 'PROOF_OF_ADDRESS_TOO_OLD',
  BusinessNotRegistered: 'BUSINESS_NOT_REGISTERED',
  NoPossibleMatch: 'NO_POSSIBLE_MATCH',
} as const;

export type CustomerDueDiligenceCode = (typeof CustomerDueDiligenceCodes)[keyof typeof CustomerDueDiligenceCodes];
