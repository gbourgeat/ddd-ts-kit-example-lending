import { ReadModelStore } from '@ddd-ts-kit/kernel';

/** One level of a delegation table: the most a decider of this level may approve, in cents. */
export type DelegationTableLevel = {
  readonly level: string;
  readonly amountCents: number;
};

/** One line of the delegation tables read model: a table credit-policy published, with the amount each level may approve. */
export type DelegationTableRow = {
  readonly delegationTableId: string;
  /** The day the table takes effect. */
  readonly effectiveFrom: Date;
  readonly levels: readonly DelegationTableLevel[];
};

/** The delegation tables read model, kept from what credit-policy publishes: one line per table. */
export abstract class DelegationTables extends ReadModelStore<DelegationTableRow> {}
