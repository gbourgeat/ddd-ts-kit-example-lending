import { AuthorizedCommand, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { DeciderLevelRow } from '@/contexts/credit-application/decision/application/ports/decider-levels.port';

/** Keeps the level of one staff member in the read model: the appointment as branch-network announced it, and the event that announced it. */
export class KeepDeciderLevelCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly row: DeciderLevelRow,
    readonly stamp: EventStamp,
  ) {
    super(actor);
  }
}
