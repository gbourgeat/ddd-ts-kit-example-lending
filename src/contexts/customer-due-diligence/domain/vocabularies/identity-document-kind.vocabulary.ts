export const IdentityDocumentKind = {
  Passport: 'Passport',
  NationalIdentityCard: 'NationalIdentityCard',
  ResidencePermit: 'ResidencePermit',
} as const;

export type IdentityDocumentKind = (typeof IdentityDocumentKind)[keyof typeof IdentityDocumentKind];
