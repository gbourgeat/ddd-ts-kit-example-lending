import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Asks every context to erase the personal data past their retention, for the period of `asOf`: the
 * instant the work is for, which the job takes from its occurrence and never from the clock. Answers
 * the rows purged.
 */
export class ErasePersonalDataPastRetentionCommand extends AuthorizedCommand<number> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
