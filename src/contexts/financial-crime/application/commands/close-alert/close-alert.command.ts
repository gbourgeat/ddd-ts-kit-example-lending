import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Closes an alert with the reason the compliance officer gives for it. */
export class CloseAlertCommand extends AuthorizedCommand<string> {
  constructor(
    actor: Actor,
    readonly alertId: string,
    readonly reason: string,
  ) {
    super(actor);
  }
}
