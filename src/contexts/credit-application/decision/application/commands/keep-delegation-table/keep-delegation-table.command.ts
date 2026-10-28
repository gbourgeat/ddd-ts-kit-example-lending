import { AuthorizedCommand, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { DelegationTableRow } from '@/contexts/credit-application/decision/application/ports/delegation-tables.port';

/** Keeps one delegation table in the read model: the table as credit-policy published it, and the event that announced it. */
export class KeepDelegationTableCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly row: DelegationTableRow,
    readonly stamp: EventStamp,
  ) {
    super(actor);
  }
}
