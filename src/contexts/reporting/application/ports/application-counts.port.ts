import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One line of the applications-per-branch read model: a branch, in a month, of one tenant. */
export type ApplicationCountRow = {
  /** The tenant, the branch and the month, joined: unique across tenants. */
  readonly key: string;
  readonly tenantId: string;
  readonly branchId: string;
  /** The month of the submissions, `YYYY-MM` in UTC. */
  readonly month: string;
  readonly applicationCount: number;
  /** The amount requested, summed, in cents. */
  readonly amountCents: number;
};

/** The applications-per-branch read model: one line per tenant, branch and month, kept by the projection. */
export abstract class ApplicationCounts extends ReadModelStore<ApplicationCountRow> {}
