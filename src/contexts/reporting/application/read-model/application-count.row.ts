/** One line of the applications-per-branch read model: a branch, in a month, of one tenant. */
export interface ApplicationCountRow {
  /** The tenant, the branch and the month, joined: unique across tenants. */
  readonly key: string;
  readonly tenantId: string;
  readonly branchId: string;
  /** The month of the submissions, `YYYY-MM` in UTC. */
  readonly month: string;
  readonly applicationCount: number;
  /** The amount requested, summed, in cents. */
  readonly amountCents: number;
}
