/** The level a staff member was appointed to, as a decider reads it. */
export interface ReadDeciderLevelResult {
  readonly staffMemberId: string;
  readonly branchId: string;
  readonly level: string;
}
