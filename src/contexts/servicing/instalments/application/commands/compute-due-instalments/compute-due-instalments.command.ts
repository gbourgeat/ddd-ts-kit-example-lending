import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Computes the instalments due in the bank of the command, at the instant `asOf` the run is for. It is about every open
 * loan of the bank, so the bank is the resource its permission is held on, not one loan.
 */
export class ComputeDueInstalmentsCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
