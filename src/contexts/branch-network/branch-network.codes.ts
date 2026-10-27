export const BranchNetworkCodes = {
  BranchNotOpened: 'BRANCH_NOT_OPENED',
  UnknownStaffMember: 'UNKNOWN_STAFF_MEMBER',
} as const;

export type BranchNetworkCode = (typeof BranchNetworkCodes)[keyof typeof BranchNetworkCodes];
