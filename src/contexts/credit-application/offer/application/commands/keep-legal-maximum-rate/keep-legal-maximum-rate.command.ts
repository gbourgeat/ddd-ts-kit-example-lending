import { AuthorizedCommand, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { LegalMaximumRateRow } from '@/contexts/credit-application/offer/application/ports/legal-maximum-rates.port';

/** Keeps one legal maximum rate in the read model: the maximum as credit-policy published it, and the event that announced it. */
export class KeepLegalMaximumRateCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly row: LegalMaximumRateRow,
    readonly stamp: EventStamp,
  ) {
    super(actor);
  }
}
