import { AuthorizedCommand, type Actor, type EventStamp } from '@ddd-ts-kit/kernel';
import type { ProductTermsRow } from '@/contexts/credit-application/file/application/ports/product-terms.port';

/** Keeps the terms of one product in the read model: the terms as credit-policy defined them, and the event that announced them. */
export class KeepProductTermsCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly row: ProductTermsRow,
    readonly stamp: EventStamp,
  ) {
    super(actor);
  }
}
