import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Erases the personal data of every customer whose relationship ended on or before the day `asOf` less the retention. */
export class ErasePersonalDataPastRetentionCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
