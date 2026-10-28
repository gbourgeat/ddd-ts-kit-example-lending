/** One line of the decisions-per-branch read model: a branch, in a month, of one tenant. */
export interface DecisionCountRow {
  /** The tenant, the branch and the month, joined: unique across tenants. */
  readonly key: string;
  readonly tenantId: string;
  readonly branchId: string;
  /** The month of the decisions, `YYYY-MM` in UTC. */
  readonly month: string;
  /** Every decision of the branch in the month. */
  readonly decisionCount: number;
  /** The decisions that approve the application: an approval, or an approval with conditions. */
  readonly approvalCount: number;
  /** The decisions that are exceptions to the policy. */
  readonly exceptionCount: number;
}
