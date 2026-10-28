import { AuthorizedQuery, type Actor } from '@ddd-ts-kit/kernel';
import type { ReadDelegationTableResult } from '@/contexts/credit-application/decision/application/queries/read-delegation-table/read-delegation-table.result';

/** The delegation table of one id, read by a decider before deciding an application. */
export class ReadDelegationTableQuery extends AuthorizedQuery<ReadDelegationTableResult> {
  constructor(
    actor: Actor,
    readonly delegationTableId: string,
  ) {
    super(actor);
  }
}
