import type { DelegationTableLevel } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';

/** A delegation table as a decider reads it: the amount each level may approve, from the day it takes effect. */
export interface ReadDelegationTableResult {
  readonly delegationTableId: string;
  /** The day the table takes effect, as an ISO 8601 instant. */
  readonly effectiveFrom: string;
  readonly levels: readonly DelegationTableLevel[];
}
