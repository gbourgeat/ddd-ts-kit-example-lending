import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Erases the personal values of every loan closed ten years before `asOf`. */
export class ErasePersonalDataPastRetentionCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
