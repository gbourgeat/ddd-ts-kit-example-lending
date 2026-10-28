import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/** Reverses the write-off of the loan by a movement of opposite effect: its outstanding capital is open again. */
export class ReverseWriteOffCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly loanId: string,
  ) {
    super(actor);
  }
}
