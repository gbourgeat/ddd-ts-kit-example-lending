import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Erases the personal data of the applications refused six months before `asOf`: the instant the nightly work is for. */
export class ErasePersonalDataPastRetentionCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
