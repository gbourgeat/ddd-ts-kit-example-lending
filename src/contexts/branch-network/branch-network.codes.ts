export const BranchNetworkCodes = {
  BranchNotOpened: 'BRANCH_NOT_OPENED',
  UnknownStaffMember: 'UNKNOWN_STAFF_MEMBER',
  UnknownPortfolio: 'UNKNOWN_PORTFOLIO',
  ConflictOnOwnRecord: 'CONFLICT_ON_OWN_RECORD',
} as const;

export type BranchNetworkCode = (typeof BranchNetworkCodes)[keyof typeof BranchNetworkCodes];
