/** A declared conflict of interest: a staff member may not prepare nor decide the applications of this customer. */
export interface DeclaredConflictRow {
  readonly conflictOfInterestId: string;
  readonly staffMemberId: string;
  readonly customerId: string;
}
