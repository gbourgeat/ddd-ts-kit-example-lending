import { AuthorizedCommand, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { RateGridRow } from '@/contexts/credit-application/offer/application/ports/rate-grids.port';

/** Keeps one rate grid in the read model: the grid as credit-policy published it, and the event that announced it. */
export class KeepRateGridCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly row: RateGridRow,
    readonly stamp: EventStamp,
  ) {
    super(actor);
  }
}
