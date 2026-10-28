import { AuthorizedCommand, type Actor } from '@ddd-ts-kit/kernel';

/**
 * Places each open loan of the bank in the arrears bucket its days past due put it in, as of the instant `asOf` the run
 * is for. It is about every open loan of the bank, so the bank is the resource its permission is held on, not one loan.
 */
export class ClassifyArrearsCommand extends AuthorizedCommand<void> {
  constructor(
    actor: Actor,
    readonly asOf: Date,
  ) {
    super(actor);
  }
}
