import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Declares in default each open loan of the bank whose days past due reach the limit, as of the instant `asOf` the run is
 * for. It is about every open loan of the bank, so the bank is the resource its permission is held on, not one loan.
 */
export class DeclareDefaultCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
