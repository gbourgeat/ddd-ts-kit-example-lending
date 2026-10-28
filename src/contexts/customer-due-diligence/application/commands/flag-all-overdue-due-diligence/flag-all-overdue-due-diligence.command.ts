import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Flags overdue every due diligence that falls due before the instant: the nightly job asks it for all customers at once; a current one is left alone. */
export class FlagAllOverdueDueDiligenceCommand extends AuthorizedCommand<number> {
  constructor(
    actor: Actor,
    readonly dueBefore: Date,
  ) {
    super(actor);
  }
}
