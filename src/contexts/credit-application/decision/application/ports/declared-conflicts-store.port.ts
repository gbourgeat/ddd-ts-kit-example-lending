import type { EventStamp } from '@ddd-ts-kit/kernel';
import type { DeclaredConflictRow } from '@/contexts/credit-application/decision/application/projections/declared-conflict-row.projection';

/** The read model of the declared conflicts of staff members: one line per conflict, kept in the order of the events that changed it. */
export abstract class DeclaredConflictsStore {
  /** Writes the line, unless the line already holds a later event: a replay or a late delivery changes nothing. */
  abstract keep(row: DeclaredConflictRow, stamp: EventStamp): Promise<void>;

  abstract find(conflictOfInterestId: string): Promise<DeclaredConflictRow | undefined>;

  /** The conflicts declared on one customer, in the order they were declared. */
  abstract searchOfCustomer(customerId: string): Promise<readonly DeclaredConflictRow[]>;
}
