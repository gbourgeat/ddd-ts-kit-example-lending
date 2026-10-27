export const BranchNetworkCodes = {
  BranchNotOpened: 'BRANCH_NOT_OPENED',
} as const;

export type BranchNetworkCode = (typeof BranchNetworkCodes)[keyof typeof BranchNetworkCodes];
